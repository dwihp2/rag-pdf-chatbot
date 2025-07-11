import { openai } from '@ai-sdk/openai';
import { streamText } from "ai";
import { qdrantService } from "@/lib/qdrant";
import { documentProcessor } from "@/lib/document-processor";
import { databaseService } from "@/lib/database";

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();
    const latestMessage = messages[messages.length - 1].content;

    // Save user message to database if chatId is provided
    const activeChatId = chatId;
    if (activeChatId && latestMessage) {
      await databaseService.createMessage({
        chatId: activeChatId,
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

    const systemMessage = `
    ### Task:
  Respond to the user query using the provided context, incorporating inline citations in the format [id] **only when the <source> tag includes an explicit id attribute** (e.g., <source id="1">).

  ### Response Format Priority:
  - **Prioritize bullet points or numbered lists** when the information can be clearly organized this way
  - Use structured formatting (bullets, numbers) for multiple items, steps, features, or comparisons
  - Only use paragraph format when the content flows better as continuous text

  ### Guidelines:
  - If you don't know the answer, clearly state that.
  - If uncertain, ask the user for clarification.
  - Respond in the same language as the user's query.
  - If the context is unreadable or of poor quality, inform the user and provide the best possible answer.
  - If the answer isn't present in the context but you possess the knowledge, explain this to the user and provide the answer using your own understanding.
  - **Only include inline citations using [id] (e.g., [1], [2]) when the <source> tag includes an id attribute.**
  - Do not cite if the <source> tag does not contain an id attribute.
  - Do not use XML tags in your response.
  - Ensure citations are concise and directly related to the information provided.
  - Always use the provided context to answer the user's questions.

  ### Example of Citation with Structured Format:
  If the user asks about benefits of a method, prioritize this format:
  **Benefits of the proposed method:**
  • Increases efficiency by 20% [1]
  • Reduces processing time by 15% [2]
  • Improves accuracy in data analysis [1]

  ### Output:
  Provide a clear and direct response to the user's query using bullet points or numbered lists when appropriate, including inline citations in the format [id] only when the <source> tag with id attribute is present in the context.

  <context>
  ${context}
  </context>
  `;

    // Build system message with context
    //   const systemMessage = `You are a helpful assistant that answers questions based on the provided documents. 
    // Use the context information to answer the user's questions to the best of your ability.
    // If you don't know the answer or can't find relevant information in the context, 
    // say so honestly rather than making up an answer.
    // Always cite your sources by mentioning which document and page number you got the information from.
    // Always respond in Indonesian language.

    // Context information:
    // ${context}`;

    console.log("🤖 Generating AI response...");

    // Stream the response using AI SDK
    const result = streamText({
      model: openai("gpt-4.1-nano"),
      system: systemMessage,
      messages,
      temperature: 0.5,
      onFinish: async ({ text, usage }) => {
        console.log("✅ Response generated successfully");
        console.log("Token usage:", usage);
        console.log("Sources:", sources.length);

        // Save assistant message to database
        if (activeChatId && text) {
          await databaseService.createMessage({
            chatId: activeChatId,
            role: 'assistant',
            content: text,
            sources: sources.length > 0 ? sources : undefined,
          });

          // Generate chat title from first message if it's still "New Chat"
          const chat = await databaseService.getChatById(activeChatId);
          if (chat && chat.title === 'New Chat') {
            await databaseService.generateChatTitle(activeChatId);
          }
        }
      },
    });

    // Return the response with sources in headers
    // Sanitize sources for header transmission (remove problematic Unicode characters)
    const sanitizedSources = sources.map(source => ({
      ...source,
      text: source.text.replace(/[^\x00-\xFF]/g, ""), // Remove non-ASCII characters
    }));

    return result.toDataStreamResponse({
      headers: {
        "X-Sources": JSON.stringify({ sources: sanitizedSources }),
        "X-Chat-Id": activeChatId || "",
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