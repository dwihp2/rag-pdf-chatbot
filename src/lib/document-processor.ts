import { vectorService } from "./vector-service";

// Simple text splitter — no langchain dependency
function splitText(
  text: string,
  chunkSize: number = 1000,
  chunkOverlap: number = 200
): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - chunkOverlap;
  }
  return chunks.filter((c) => c.trim().length > 10);
}

// Lazy-load pdf-parse (heavy dependency). Uses pagerender to keep per-page text.
async function parsePdfPages(buffer: ArrayBuffer): Promise<{
  pages: string[];
  numPages: number;
}> {
  const pdfParse = (await import("pdf-parse")).default;
  const data = Buffer.from(new Uint8Array(buffer));
  const pages: string[] = [];
  const result = await pdfParse(data, {
    pagerender: (pageData: { getTextContent: () => Promise<{ items: Array<{ str: string }> }> }) =>
      pageData.getTextContent().then((tc) => {
        const text = tc.items.map((i) => i.str).join(" ");
        pages.push(text);
        return text;
      }),
  });
  return { pages, numPages: result.numpages };
}

export const documentProcessor = {
  async processPDF(file: File): Promise<{
    filename: string;
    chunks: Array<{ text: string; pageNumber: number; chunkIndex: number }>;
    pageCount: number;
  }> {
    const buffer = await file.arrayBuffer();
    const { pages, numPages } = await parsePdfPages(buffer);

    const chunks: Array<{ text: string; pageNumber: number; chunkIndex: number }> = [];
    pages.forEach((pageText, pageIndex) => {
      for (const chunkText of splitText(pageText)) {
        chunks.push({
          text: chunkText,
          pageNumber: pageIndex + 1,
          chunkIndex: chunks.length,
        });
      }
    });

    return { filename: file.name, chunks, pageCount: numPages };
  },

  async processMultiplePDFs(files: File[]): Promise<
    Array<{
      filename: string;
      chunks: Array<{ text: string; pageNumber: number; chunkIndex: number }>;
      pageCount: number;
    }>
  > {
    const results = [];
    for (const file of files) {
      try {
        results.push(await this.processPDF(file));
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
      }
    }
    return results;
  },

  async generateQueryEmbedding(query: string): Promise<number[]> {
    return vectorService.generateQueryEmbedding(query);
  },
};
