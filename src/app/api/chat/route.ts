import { deepseek } from "@ai-sdk/deepseek";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
} from "ai";
import { auth } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { retrieveContext } from "@/lib/retrieval";
import { createDocumentTools } from "@/lib/document-tools";
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

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get("chatId");
  if (!chatId) return new Response("Missing chatId", { status: 400 });

  // Verify ownership
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId: session.user.id },
    select: { id: true },
  });
  if (!chat) return new Response("Not found", { status: 404 });

  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true, sources: true, createdAt: true },
  });

  // Convert to UI message format that assistant-ui expects
  const uiMessages = messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    parts: [{ type: "text" as const, text: m.content }],
    createdAt: m.createdAt,
  }));

  return Response.json({ messages: uiMessages });
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
Respond to the user query using the provided context. When the context contains relevant information, cite sources using [N] format where N refers to the [Document N] marker in the context.

### Available Tools:
You have access to three tools for querying the document library directly:
- **countDocuments** — Use when the user asks "how many documents about X?" or any counting question. Returns an exact count from the database. The filter matches filenames (case-insensitive).
- **listDocuments** — Use when the user asks "what documents do I have?" or wants to browse/browse by topic. Returns full document metadata (name, size, chunk count, upload date, summary).
- **getDocumentContent** — Use when the user asks to read or summarize a specific document. Pass the document ID from a previous listDocuments result. Returns all text chunks with page numbers.

### When to use tools vs. provided context:
- **Counting / listing questions** → ALWAYS use countDocuments or listDocuments. The <context> below only contains a small sample of chunks — it cannot give you a complete or accurate count. Never estimate counts from the context.
- **Content questions** ("what does the guide say about X?") → Use the <context> first. Only fall back to getDocumentContent if the context is insufficient.
- If both context and tools could answer, prefer tools for factual accuracy.
- **IMPORTANT**: When using a tool, call it WITHOUT any preamble text. Do not say "Let me look that up..." or "I'll list those...". Just call the tool directly. You will summarize the results AFTER the tool returns.

### Citation Rules:
- Cite factual claims supported by the context: "The sky is blue. [1]"
- Place punctuation BEFORE the citation: "This is correct. [1]"
- Multiple sources for one claim: "This is well-documented. [1], [3]"
- If the context says "No relevant information found", answer from general knowledge but clearly state that the documents don't contain relevant information. Do NOT fabricate citations.
- Only cite when the context actually contains usable information.

### Response Format:
- Prefer bullet points or numbered lists for structured information
- Keep responses clear and concise
- Respond in the same language as the user

<context>
${context}
</context>`;

    const result = streamText({
      model: deepseek("deepseek-chat"),
      system: systemMessage,
      messages: await convertToModelMessages(messages),
      tools: createDocumentTools({
        userId: session.user.id,
        collectionId: activeCollectionId ?? undefined,
      }),
      stopWhen: isStepCount(10),
      temperature: 0.5,
      onEnd: async ({ text }) => {
        // Save assistant message with sources
        if (text && text.length > 0) {
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
        }

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

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
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
