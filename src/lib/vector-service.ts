import { prisma } from "./database";
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

export interface DocumentChunk {
  id: string;
  text: string;
  source: {
    filename: string;
    page: number;
  };
  embedding?: number[];
}

export interface SearchResult {
  id: string;
  score: number;
  payload: {
    text: string;
    source: {
      filename: string;
      page: number;
    };
  };
}

export interface VectorSearchResult {
  id: string;
  text: string;
  pageNumber: number;
  filename: string;
  originalName: string;
  similarity: number;
}

export class VectorService {
  private embeddingModel = openai.embedding('text-embedding-3-small');

  /**
   * Generate embeddings for text chunks
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const embeddings: number[][] = [];

      // Process texts in batches to avoid rate limits
      const BATCH_SIZE = 10;
      for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        const batch = texts.slice(i, i + BATCH_SIZE);
        const batchEmbeddings = await Promise.all(
          batch.map(async (text) => {
            const { embedding } = await embed({
              model: this.embeddingModel,
              value: text,
            });
            return embedding;
          })
        );
        embeddings.push(...batchEmbeddings);
      }

      return embeddings;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  /**
   * Generate embedding for a single query
   */
  async generateQueryEmbedding(query: string): Promise<number[]> {
    try {
      const { embedding } = await embed({
        model: this.embeddingModel,
        value: query,
      });
      return embedding;
    } catch (error) {
      console.error('Error generating query embedding:', error);
      throw new Error('Failed to generate query embedding');
    }
  }

  /**
   * Add document chunks to the vector database
   */
  async addDocuments(documentId: string, chunks: DocumentChunk[]): Promise<void> {
    if (chunks.length === 0) return;

    try {
      console.log(`📊 Adding ${chunks.length} chunks to vector database...`);

      // Generate embeddings for all chunks
      const texts = chunks.map(chunk => chunk.text);
      const embeddings = await this.generateEmbeddings(texts);

      // Store chunks with embeddings in database using individual creates to avoid raw SQL
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = embeddings[i];
        
        await this.insertChunkWithRetry(chunk, documentId, embedding, i);

        if ((i + 1) % 10 === 0) {
          console.log(`✅ Inserted ${i + 1}/${chunks.length} chunks`);
        }
      }      console.log(`✅ Successfully added ${chunks.length} chunks to vector database`);

    } catch (error) {
      console.error('Error adding documents to vector database:', error);
      throw new Error('Failed to add documents to vector database');
    }
  }

  /**
   * Search for similar documents using vector similarity
   */
  async searchSimilar(
    queryEmbedding: number[],
    limit: number = 5,
    threshold: number = 0.7
  ): Promise<SearchResult[]> {
    try {
      // Perform cosine similarity search using pgvector
      const results = await this.performVectorSearch(queryEmbedding, limit, threshold);

      // Convert to the expected format
      return results.map((result) => ({
        id: result.id,
        score: result.similarity,
        payload: {
          text: result.text,
          source: {
            filename: result.filename,
            page: result.pageNumber,
          },
        },
      }));

    } catch (error) {
      console.error('Error searching similar documents:', error);
      throw new Error('Failed to search similar documents');
    }
  }

  /**
   * Perform the actual vector search with retry logic for connection issues
   */
  private async insertChunkWithRetry(
    chunk: DocumentChunk,
    documentId: string,
    embedding: number[],
    chunkIndex: number,
    maxRetries: number = 3
  ): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await prisma.$executeRaw`
          INSERT INTO document_chunks (id, document_id, text, page_number, chunk_index, embedding, created_at)
          VALUES (${chunk.id}, ${documentId}, ${chunk.text}, ${chunk.source.page}, ${chunkIndex}, ${embedding}::vector, NOW())
        `;
        return; // Success
      } catch (error) {
        console.log(`⚠️  Insert attempt ${attempt}/${maxRetries} failed for chunk ${chunkIndex}:`, error);
        
        if (attempt === maxRetries) {
          throw error; // Final attempt failed
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  private async performVectorSearch(
    queryEmbedding: number[],
    limit: number,
    threshold: number,
    retryCount: number = 0
  ): Promise<VectorSearchResult[]> {
    try {
      const results = await prisma.$queryRaw<VectorSearchResult[]>`
        SELECT 
          chunk.id,
          chunk.text,
          chunk.page_number as "pageNumber",
          document.filename,
          document.original_name as "originalName",
          1 - (chunk.embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity
        FROM document_chunks chunk
        JOIN documents document ON chunk.document_id = document.id
        WHERE document.status = 'completed'
        AND 1 - (chunk.embedding <=> ${JSON.stringify(queryEmbedding)}::vector) > ${threshold}
        ORDER BY chunk.embedding <=> ${JSON.stringify(queryEmbedding)}::vector
        LIMIT ${limit}
      `;

      return results;
    } catch (error: unknown) {
      console.error('Vector search error:', error);
      
      // Handle connection closed errors
      if (error && typeof error === 'object' && 'message' in error && 
          typeof error.message === 'string' && 
          (error.message.includes('Closed') || error.message.includes('connection'))) {
        if (retryCount < 3) {
          console.log(`Connection error detected, retrying vector search (attempt ${retryCount + 1}/3)...`);
          await prisma.$disconnect();
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return this.performVectorSearch(queryEmbedding, limit, threshold, retryCount + 1);
        }
      }
      
      throw error;
    }
  }

  /**
   * Delete all chunks for a document
   */
  async deleteDocumentChunks(documentId: string): Promise<void> {
    try {
      await prisma.documentChunk.deleteMany({
        where: { documentId },
      });
      console.log(`✅ Deleted all chunks for document: ${documentId}`);
    } catch (error) {
      console.error('Error deleting document chunks:', error);
      throw new Error('Failed to delete document chunks');
    }
  }

  /**
   * Get collection statistics
   */
  async getStats() {
    try {
      const totalDocuments = await prisma.document.count();
      const totalChunks = await prisma.documentChunk.count();
      const completedDocuments = await prisma.document.count({
        where: { status: 'completed' },
      });

      return {
        totalDocuments,
        totalChunks,
        completedDocuments,
        vectorsCount: totalChunks,
        indexedVectorsCount: totalChunks, // All chunks are indexed
        pointsCount: totalChunks,
        status: 'green',
      };
    } catch (error) {
      console.error('Error getting vector database stats:', error);
      return null;
    }
  }

  /**
   * Clear all vectors from the database (for testing/reset)
   */
  async clearAllVectors(): Promise<void> {
    try {
      await prisma.documentChunk.deleteMany({});
      console.log('✅ Cleared all vectors from database');
    } catch (error) {
      console.error('Error clearing vectors:', error);
      throw new Error('Failed to clear vectors');
    }
  }
}

// Export singleton instance
export const vectorService = new VectorService();
