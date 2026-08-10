import { vectorService } from "./vector-service";
import type { AppSource } from "@/types";

export async function retrieveContext(
  query: string,
  collectionId?: string
): Promise<{
  context: string;
  sources: AppSource[];
}> {
  const queryEmbedding = await vectorService.generateQueryEmbedding(query);
  const results = await vectorService.searchSimilar(
    queryEmbedding,
    8,
    0.35,
    collectionId
  );

  if (results.length === 0) {
    return {
      context: "No relevant information found in the documents.",
      sources: [],
    };
  }

  const context = results
    .map((r, i) => `[Document ${i + 1}] ${r.text}`)
    .join("\n\n");

  const sources: AppSource[] = results.map((r, i) => ({
    id: `doc-${i + 1}`,
    documentId: r.documentId,
    filename: r.filename,
    page: r.pageNumber,
    snippet: r.text.substring(0, 150) + "...",
    score: Math.round(r.similarity * 100) / 100,
  }));

  return { context, sources };
}
