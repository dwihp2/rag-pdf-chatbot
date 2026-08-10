import { google } from "@ai-sdk/google";
import { embed, embedMany } from "ai";
import { prisma } from "./db";

const EMBEDDING_MODEL = "gemini-embedding-001";
const BATCH_SIZE = 10;

export const vectorService = {
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const { embeddings: batchEmbeddings } = await embedMany({
        model: google.embedding(EMBEDDING_MODEL),
        values: batch,
      });
      embeddings.push(...batchEmbeddings);
    }
    return embeddings;
  },

  async generateQueryEmbedding(query: string): Promise<number[]> {
    const { embedding } = await embed({
      model: google.embedding(EMBEDDING_MODEL),
      value: query,
    });
    return embedding;
  },

  async addDocuments(
    documentId: string,
    chunks: { text: string; pageNumber: number; chunkIndex: number }[]
  ) {
    const texts = chunks.map((c) => c.text);
    const embeddings = await this.generateEmbeddings(texts);

    const rows = chunks.map((chunk, i) => ({
      documentId,
      text: chunk.text,
      pageNumber: chunk.pageNumber,
      chunkIndex: chunk.chunkIndex,
      embedding: embeddings[i],
    }));

    // Batch insert with raw SQL for pgvector
    for (const row of rows) {
      const embeddingStr = `[${row.embedding.join(",")}]`;
      await prisma.$executeRawUnsafe(
        `INSERT INTO "DocumentChunk" (id, "documentId", text, "pageNumber", "chunkIndex", embedding, "createdAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5::vector, NOW())`,
        row.documentId,
        row.text,
        row.pageNumber,
        row.chunkIndex,
        embeddingStr
      );
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { chunkCount: chunks.length, status: "completed" },
    });
  },

  async searchSimilar(
    queryEmbedding: number[],
    limit: number = 8,
    threshold: number = 0.6,
    collectionId?: string
  ) {
    const embeddingStr = `[${queryEmbedding.join(",")}]`;

    const hasCollection = !!collectionId;

    const query = hasCollection
      ? `SELECT
        dc.id,
        dc."documentId",
        dc.text,
        dc."pageNumber",
        dc."chunkIndex",
        1 - (dc.embedding <=> $1::vector) AS similarity,
        d.filename
       FROM "DocumentChunk" dc
       JOIN "Document" d ON d.id = dc."documentId"
       WHERE d.status = 'completed'
         AND 1 - (dc.embedding <=> $1::vector) > $2
         AND EXISTS (
           SELECT 1 FROM "CollectionDocument" cd
           WHERE cd."documentId" = dc."documentId"
             AND cd."collectionId" = $4
         )
       ORDER BY dc.embedding <=> $1::vector
       LIMIT $3`
      : `SELECT
        dc.id,
        dc."documentId",
        dc.text,
        dc."pageNumber",
        dc."chunkIndex",
        1 - (dc.embedding <=> $1::vector) AS similarity,
        d.filename
       FROM "DocumentChunk" dc
       JOIN "Document" d ON d.id = dc."documentId"
       WHERE d.status = 'completed'
         AND 1 - (dc.embedding <=> $1::vector) > $2
       ORDER BY dc.embedding <=> $1::vector
       LIMIT $3`;

    const params: (string | number | null)[] = [embeddingStr, threshold, limit];
    if (hasCollection) params.push(collectionId!);

    const results = await prisma.$queryRawUnsafe<
      Array<{
        id: string;
        documentId: string;
        text: string;
        pageNumber: number;
        chunkIndex: number;
        similarity: number;
        filename: string;
      }>
    >(query, ...params);

    // Deduplicate by document — keep highest-scoring chunk per document
    const seen = new Set<string>();
    const deduped = results.filter((r) => {
      if (seen.has(r.documentId)) return false;
      seen.add(r.documentId);
      return true;
    });

    return deduped;
  },
};
