import { QdrantClient } from "@qdrant/js-client-rest";
import { OpenAIEmbeddings } from "@langchain/openai";

export const COLLECTION_NAME = "pdf_documents";
export const VECTOR_SIZE = 1024;
export const SIMILARITY_THRESHOLD = 0.3; // Lowered for better recall
export const TOP_K = 5;

// Initialize Qdrant client
export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
  apiKey: process.env.QDRANT_API_KEY,
});

// Initialize embeddings
export const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
  dimensions: VECTOR_SIZE,
});

export interface DocumentChunk {
  id: string;
  text: string;
  source: {
    filename: string;
    page: number;
  };
  vector?: number[];
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

export class QdrantService {
  private client: QdrantClient;

  constructor() {
    this.client = qdrant;
  }

  /**
   * Initialize or ensure the collection exists
   */
  async ensureCollection(): Promise<void> {
    try {
      await this.client.getCollection(COLLECTION_NAME);
      console.log(`Collection '${COLLECTION_NAME}' exists`);
    } catch (error) {
      console.log(`Creating collection '${COLLECTION_NAME}'...`);
      await this.client.createCollection(COLLECTION_NAME, {
        vectors: {
          size: VECTOR_SIZE,
          distance: "Cosine",
        },
        optimizers_config: {
          default_segment_number: 2,
        },
        replication_factor: 1,
      });
      console.log(`Collection '${COLLECTION_NAME}' created successfully`);
    }
  }

  /**
   * Add document chunks to the collection
   */
  async addDocuments(chunks: DocumentChunk[]): Promise<void> {
    if (chunks.length === 0) return;

    await this.ensureCollection();

    const points = chunks.map((chunk) => ({
      id: chunk.id,
      vector: chunk.vector!,
      payload: {
        text: chunk.text,
        source: chunk.source,
      },
    }));

    const BATCH_SIZE = 100;
    for (let i = 0; i < points.length; i += BATCH_SIZE) {
      const batch = points.slice(i, i + BATCH_SIZE);
      await this.client.upsert(COLLECTION_NAME, {
        wait: true,
        points: batch,
      });
      console.log(`Uploaded batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(points.length / BATCH_SIZE)}`);
    }
  }

  /**
   * Search for similar documents
   */
  async searchSimilar(
    queryVector: number[],
    limit: number = TOP_K,
    scoreThreshold: number = SIMILARITY_THRESHOLD
  ): Promise<SearchResult[]> {
    await this.ensureCollection();

    const searchResult = await this.client.search(COLLECTION_NAME, {
      vector: queryVector,
      limit,
      score_threshold: scoreThreshold,
      with_payload: true,
    });

    return searchResult.map((result) => ({
      id: result.id as string,
      score: result.score,
      payload: result.payload as SearchResult['payload'],
    }));
  }

  /**
   * Get collection info
   */
  async getCollectionInfo() {
    try {
      const info = await this.client.getCollection(COLLECTION_NAME);
      return info;
    } catch (error) {
      console.error("Error getting collection info:", error);
      return null;
    }
  }

  /**
   * Delete documents by filename
   */
  async deleteDocumentsByFilename(filename: string): Promise<void> {
    await this.client.delete(COLLECTION_NAME, {
      filter: {
        must: [
          {
            key: "source.filename",
            match: { value: filename },
          },
        ],
      },
    });
  }

  /**
   * Clear all documents from the collection
   */
  async clearCollection(): Promise<void> {
    try {
      await this.client.deleteCollection(COLLECTION_NAME);
      await this.ensureCollection();
      console.log(`Collection '${COLLECTION_NAME}' cleared and recreated`);
    } catch (error) {
      console.error("Error clearing collection:", error);
      throw error;
    }
  }

  /**
   * Get collection statistics
   */
  async getStats() {
    try {
      const info = await this.client.getCollection(COLLECTION_NAME);
      return {
        vectorsCount: info.vectors_count,
        indexedVectorsCount: info.indexed_vectors_count,
        pointsCount: info.points_count,
        segmentsCount: info.segments_count,
        status: info.status,
      };
    } catch (error) {
      console.error("Error getting collection stats:", error);
      return null;
    }
  }
}

// Export singleton instance
export const qdrantService = new QdrantService();
