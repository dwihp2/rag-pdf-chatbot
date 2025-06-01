import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { qdrantService } from "@/lib/qdrant";
import { documentProcessor } from "@/lib/document-processor";
import { databaseService } from "@/lib/database";

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();
    const latestMessage = messages[messages.length - 1].content;

    // If chatId is provided, save the user message to database
    if (chatId) {
      databaseService.createMessage({
        chatId,
        role: 'user',
        content: latestMessage,
      });
    }

    console.log("🔍 Searching for relevant documents...");

    // Generate embedding for the query
    const queryEmbedding = await documentProcessor.generateQueryEmbedding(latestMessage);

    // Search for relevant documents with lower threshold for better recall
    const searchResults = await qdrantService.searchSimilar(queryEmbedding, 5, 0.2);

    // Format the retrieved documents for context
    let context = "";
    const sources: Array<{
      filename: string;
      page: number;
      text: string;
      score: number;
    }> = [];

    if (searchResults.length > 0) {
      context = "Here is information retrieved from the documents:\n\n";

      searchResults.forEach((result, index) => {
        context += `[Document ${index + 1}] ${result.payload.text}\n\n`;

        const source = {
          filename: result.payload.source.filename,
          page: result.payload.source.page,
          text: result.payload.text.substring(0, 150) + "...",
          score: result.score,
        };
        sources.push(source);
      });

      console.log(`✅ Found ${searchResults.length} relevant documents`);
    } else {
      context = "No relevant information found in the documents.";
      console.log("⚠️ No relevant documents found");
    }

    // Build system message with context
    const systemMessage = `You are a helpful assistant that answers questions based on the provided documents. 
  Use the context information to answer the user's questions to the best of your ability.
  If you don't know the answer or can't find relevant information in the context, 
  say so honestly rather than making up an answer.
  Always cite your sources by mentioning which document and page number you got the information from.
  Always respond in Indonesian language.

  Context information:
  ${context}`;

    console.log("🤖 Generating AI response...");

    // Stream the response using AI SDK
    const result = streamText({
      model: anthropic("claude-3-haiku-20240307"),
      system: systemMessage,
      messages,
      temperature: 0.5,
      onFinish: async ({ text, usage }) => {
        console.log("✅ Response generated successfully");
        console.log("Token usage:", usage);
        console.log("Sources:", sources.length);

        // Save assistant message to database if chatId is provided
        if (chatId && text) {
          databaseService.createMessage({
            chatId,
            role: 'assistant',
            content: text,
            sources: sources.length > 0 ? sources : undefined,
          });

          // Generate chat title from first message if it's still "New Chat"
          const chat = databaseService.getChatById(chatId);
          if (chat && chat.title === 'New Chat') {
            databaseService.generateChatTitle(chatId);
          }
        }
      },
    });

    // Return the response with sources in headers
    return result.toDataStreamResponse({
      headers: {
        "X-Sources": JSON.stringify({ sources }),
        "X-Chat-Id": chatId || "",
      },
    });

  } catch (error) {
    console.error("❌ Error in chat API:", error);
    return new Response(
      JSON.stringify({
        error: "There was an error processing your request",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}