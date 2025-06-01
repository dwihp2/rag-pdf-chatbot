import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { v4 as uuidv4 } from "uuid";
import { embeddings, DocumentChunk } from "./qdrant";
import fs from "fs";
import path from "path";
import os from "os";

export interface ProcessedDocument {
  filename: string;
  chunks: DocumentChunk[];
  totalPages: number;
  totalChunks: number;
}

export class DocumentProcessor {
  private textSplitter: RecursiveCharacterTextSplitter;
  private tmpDir: string;

  constructor() {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ["\n\n", "\n", " ", ""],
    });

    this.tmpDir = path.join(os.tmpdir(), "pdf-uploads");
    this.ensureTmpDir();
  }

  private ensureTmpDir(): void {
    if (!fs.existsSync(this.tmpDir)) {
      fs.mkdirSync(this.tmpDir, { recursive: true });
    }
  }

  /**
   * Process a single PDF file and return document chunks with embeddings
   */
  async processPDF(file: File): Promise<ProcessedDocument> {
    const filename = file.name;
    const filePath = path.join(this.tmpDir, filename);

    try {
      // Write file to disk
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      // Load PDF
      const loader = new PDFLoader(filePath);
      const docs = await loader.load();

      const chunks: DocumentChunk[] = [];
      let totalChunks = 0;

      // Process each page
      for (let pageIndex = 0; pageIndex < docs.length; pageIndex++) {
        const doc = docs[pageIndex];
        const pageNumber = doc.metadata.loc?.pageNumber || pageIndex + 1;

        // Split text into chunks
        const textChunks = await this.textSplitter.splitText(doc.pageContent);

        // Create embeddings for each chunk
        for (const chunkText of textChunks) {
          if (chunkText.trim().length > 0) {
            const embeddingResult = await embeddings.embedDocuments([chunkText]);

            if (embeddingResult.length > 0) {
              const chunk: DocumentChunk = {
                id: uuidv4(),
                text: chunkText.trim(),
                source: {
                  filename,
                  page: pageNumber,
                },
                vector: embeddingResult[0],
              };

              chunks.push(chunk);
              totalChunks++;
            }
          }
        }
      }

      return {
        filename,
        chunks,
        totalPages: docs.length,
        totalChunks,
      };

    } finally {
      // Clean up temp file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  /**
   * Process multiple PDF files
   */
  async processMultiplePDFs(files: File[]): Promise<ProcessedDocument[]> {
    const results: ProcessedDocument[] = [];

    for (const file of files) {
      try {
        console.log(`Processing ${file.name}...`);
        const result = await this.processPDF(file);
        results.push(result);
        console.log(`✓ Processed ${file.name}: ${result.totalChunks} chunks from ${result.totalPages} pages`);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        // Continue with other files even if one fails
      }
    }

    return results;
  }

  /**
   * Generate embedding for a query text
   */
  async generateQueryEmbedding(query: string): Promise<number[]> {
    const embedResult = await embeddings.embedQuery(query);
    return embedResult;
  }

  /**
   * Clean up temporary directory
   */
  cleanupTmpDir(): void {
    try {
      if (fs.existsSync(this.tmpDir)) {
        const files = fs.readdirSync(this.tmpDir);
        for (const file of files) {
          fs.unlinkSync(path.join(this.tmpDir, file));
        }
      }
    } catch (error) {
      console.error("Error cleaning up temp directory:", error);
    }
  }
}

// Export singleton instance
export const documentProcessor = new DocumentProcessor();
