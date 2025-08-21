import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { v4 as uuidv4 } from "uuid";
import { vectorService, DocumentChunk } from "./vector-service";
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
      console.log(`📖 Processing PDF: ${filename}`);

      // Write file to disk
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      // Suppress console warnings during PDF parsing to hide TT function warnings
      const originalConsoleWarn = console.warn;
      const originalConsoleError = console.error;

      console.warn = (...args) => {
        const message = args.join(' ');
        if (!message.includes('TT: undefined function') &&
          !message.includes('Warning: TT:') &&
          !message.includes('OPS.dependency')) {
          originalConsoleWarn.apply(console, args);
        }
      };

      console.error = (...args) => {
        const message = args.join(' ');
        if (!message.includes('TT: undefined function') &&
          !message.includes('Warning: TT:') &&
          !message.includes('OPS.dependency')) {
          originalConsoleError.apply(console, args);
        }
      };

      let docs;
      try {
        // Configure PDF loader with basic options
        const loader = new PDFLoader(filePath, {
          splitPages: true,
          parsedItemSeparator: "\n",
        });

        docs = await loader.load();
        console.log(`📄 Successfully extracted ${docs.length} pages from ${filename}`);
      } catch (pdfError) {
        console.warn(`⚠️ PDF parsing had issues for ${filename}, but continuing:`, pdfError);
        // If PDF parsing fails completely, create a minimal document structure
        docs = [{
          pageContent: "Error: Could not extract text from this PDF file. The file may be corrupted or contain unsupported elements.",
          metadata: { loc: { pageNumber: 1 } }
        }];
      } finally {
        // Restore console functions
        console.warn = originalConsoleWarn;
        console.error = originalConsoleError;
      }

      const chunks: DocumentChunk[] = [];
      let totalChunks = 0;

      // Process each page with progress tracking
      for (let pageIndex = 0; pageIndex < docs.length; pageIndex++) {
        const doc = docs[pageIndex];
        const pageNumber = doc.metadata.loc?.pageNumber || pageIndex + 1;

        console.log(`🔄 Processing page ${pageNumber}/${docs.length} of ${filename}`);

        // Skip empty pages
        if (!doc.pageContent || doc.pageContent.trim().length === 0) {
          console.log(`⏭️ Skipping empty page ${pageNumber}`);
          continue;
        }

        // Split text into chunks
        const textChunks = await this.textSplitter.splitText(doc.pageContent);
        console.log(`📝 Created ${textChunks.length} text chunks for page ${pageNumber}`);

        // Create embeddings for each chunk with progress tracking
        for (let chunkIndex = 0; chunkIndex < textChunks.length; chunkIndex++) {
          const chunkText = textChunks[chunkIndex];

          if (chunkText.trim().length > 10) { // Only process meaningful chunks
            try {
              console.log(`⚡ Processing chunk ${chunkIndex + 1}/${textChunks.length} on page ${pageNumber}`);

              const chunk: DocumentChunk = {
                id: uuidv4(),
                text: chunkText.trim(),
                source: {
                  filename,
                  page: pageNumber,
                },
              };

              chunks.push(chunk);
              totalChunks++;

              // Log progress every 3 chunks to reduce noise
              if (totalChunks % 3 === 0) {
                console.log(`📊 Progress: ${totalChunks} chunks processed so far`);
              }
            } catch (processingError) {
              console.warn(`⚠️ Failed to process chunk on page ${pageNumber}:`, processingError);
              // Continue processing other chunks
            }
          }
        }
      }

      const result = {
        filename,
        chunks,
        totalPages: docs.length,
        totalChunks,
      };

      console.log(`✅ Completed processing ${filename}: ${totalChunks} chunks from ${docs.length} pages`);
      return result;

    } catch (error) {
      console.error(`❌ Error processing PDF ${filename}:`, error);
      throw error;
    } finally {
      // Clean up temp file
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (cleanupError) {
          console.warn(`⚠️ Failed to cleanup temp file ${filePath}:`, cleanupError);
        }
      }
    }
  }

  /**
   * Process multiple PDF files
   */
  async processMultiplePDFs(files: File[]): Promise<ProcessedDocument[]> {
    const results: ProcessedDocument[] = [];

    console.log(`🔄 Starting batch processing of ${files.length} PDF files...`);

    for (const file of files) {
      try {
        const result = await this.processPDF(file);
        results.push(result);
        console.log(`✓ Processed ${file.name}: ${result.totalChunks} chunks from ${result.totalPages} pages`);
      } catch (error) {
        console.error(`❌ Failed to process ${file.name}:`, error);
        // Continue with other files instead of failing completely
      }
    }

    console.log(`✅ Batch processing completed: ${results.length}/${files.length} files processed successfully`);
    return results;
  }

  /**
   * Generate embedding for a query string
   */
  async generateQueryEmbedding(query: string): Promise<number[]> {
    return await vectorService.generateQueryEmbedding(query);
  }

  /**
   * Clean up temporary directory
   */
  async cleanupTmpDir(): Promise<void> {
    try {
      const files = fs.readdirSync(this.tmpDir);
      for (const file of files) {
        fs.unlinkSync(path.join(this.tmpDir, file));
      }
      console.log(`🧹 Cleaned up ${files.length} temporary files`);
    } catch (error) {
      console.warn("Failed to cleanup tmp directory:", error);
    }
  }
}

export const documentProcessor = new DocumentProcessor();
