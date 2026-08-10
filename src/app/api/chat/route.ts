import { deepseek } from "@ai-sdk/deepseek";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from "ai";
import { auth } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { retrieveContext } from "@/lib/retrieval";
import type { MyUIMessage } from "@/types";
import { Prisma } from "@prisma/client";
import { headers } from "next/headers";

// Extract plain text from a UIMessage (v7 messages use `parts`, older clients send flat `content`)
function messageText(message: MyUIMessage): string {
  if (message.parts) {
    return message.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
  }
  return (message as unknown as { content?: string }).content ?? "";
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages, chatId } = (await req.json()) as {
      messages: MyUIMessage[];
      chatId?: string;
    };
    const latestMessage = messageText(messages[messages.length - 1]);

    // Get or create chat
    let activeChatId = chatId;
    let activeCollectionId: string | null = null;
    if (activeChatId) {
      const owned = await prisma.chat.findFirst({
        where: { id: activeChatId, userId: session.user.id },
        select: { id: true, collectionId: true },
      });
      if (!owned) {
        return new Response("Forbidden", { status: 403 });
      }
      activeCollectionId = owned.collectionId;
    } else {
      const chat = await prisma.chat.create({
        data: {
          userId: session.user.id,
          title: latestMessage.substring(0, 50),
        },
      });
      activeChatId = chat.id;
    }

    // Save user message
    await prisma.message.create({
      data: {
        chatId: activeChatId,
        role: "user",
        content: latestMessage,
      },
    });

    // Retrieve context (scoped to collection if chat belongs to one)
    const { context, sources } = await retrieveContext(
      latestMessage,
      activeCollectionId ?? undefined
    );

    const systemMessage = `### Task:
Respond to the user query using the provided context. You MUST include inline citations in the format [N] for EVERY factual claim you make that is supported by the context. N refers to the [Document N] marker in the context.

### Citation Rules:
- EVERY factual claim MUST have a citation: "The sky is blue. [1]"
- Place punctuation BEFORE the citation: "This is correct. [1]"
- NOT: "This is correct [1]."
- Multiple sources for one claim: "This is well-documented. [1], [3]"
- If you don't know or the context doesn't cover it, say so honestly — do NOT fabricate citations.

### Response Format:
- Prefer bullet points or numbered lists for structured information
- Keep responses clear and concise
- Respond in the same language as the user

<context>
${context}
</context>`;

    const stream = createUIMessageStream<MyUIMessage>({
      execute: async ({ writer }) => {
        // Stream sources as first-class data parts
        if (sources.length > 0) {
          writer.write({
            type: "data-sources",
            id: "sources",
            data: { sources },
          });
        } else {
          // Stream notification
          writer.write({
            type: "data-notification",
            data: {
              message:
                "No relevant documents found. Answering from general knowledge.",
              level: "warning",
            },
            transient: true,
          });
        }

        const result = streamText({
          model: deepseek("deepseek-chat"),
          system: systemMessage,
          messages: await convertToModelMessages(messages),
          temperature: 0.5,
          onEnd: async ({ text }) => {
            // Save assistant message with sources
            await prisma.message.create({
              data: {
                chatId: activeChatId,
                role: "assistant",
                content: text,
                sources:
                  sources.length > 0
                    ? (sources as unknown as Prisma.InputJsonValue)
                    : undefined,
              },
            });

            // Auto-title if "New Chat"
            const chat = await prisma.chat.findUnique({
              where: { id: activeChatId },
            });
            if (chat && chat.title === "New Chat") {
              await prisma.chat.update({
                where: { id: activeChatId },
                data: { title: latestMessage.substring(0, 50) },
              });
            }
          },
        });

        writer.merge(toUIMessageStream({ stream: result.stream }));
      },
    });

    return createUIMessageStreamResponse({
      stream,
      headers: { "X-Chat-Id": activeChatId },
    });
  } catch (error) {
    console.error("❌ Error in chat API:", error);
    return new Response(
      JSON.stringify({
        error: "There was an error processing your request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
