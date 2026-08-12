import { z } from "zod";
import { prisma } from "./db";

// ── Shared helpers ──────────────────────────────────────────────

interface ToolContext {
  userId: string;
  collectionId?: string;
}

function buildDocumentFilter(
  filter: string | undefined,
  userId: string,
  collectionId?: string
) {
  const conditions: string[] = [];
  const params: (string | null)[] = [];

  // Ownership
  params.push(userId);
  conditions.push(`d."userId" = $${params.length}`);

  // Only completed documents
  conditions.push(`d.status = 'completed'`);

  // ILIKE filter on filename + originalName
  if (filter) {
    params.push(`%${filter}%`, `%${filter}%`);
    conditions.push(
      `(d.filename ILIKE $${params.length - 1} OR d."originalName" ILIKE $${params.length})`
    );
  }

  // Collection scoping
  if (collectionId) {
    params.push(collectionId);
    conditions.push(
      `EXISTS (SELECT 1 FROM "CollectionDocument" cd WHERE cd."documentId" = d.id AND cd."collectionId" = $${params.length})`
    );
  }

  return { conditions, params };
}

// ── Return shape (Document row minus userId) ────────────────────

interface DocumentInfo {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  status: string;
  chunkCount: number;
  uploadedAt: Date;
  summary: string | null;
}

// ── Factory ─────────────────────────────────────────────────────
// Each tool captures { userId, collectionId } via closure so the
// chat route doesn't need to thread context through the AI SDK.

export function createDocumentTools(ctx: ToolContext) {
  return {
    listDocuments: {
      description:
        "List documents matching an optional search filter. Use this when the user asks what documents exist, wants to browse their document library, or needs to find a specific document by name. The filter matches against filename and original filename (case-insensitive).",
      inputSchema: z.object({
        filter: z
          .string()
          .optional()
          .describe(
            "Optional search term to filter documents by filename. Use keywords the user mentioned (e.g. 'coding', 'typescript', 'api'). Leave empty to list all documents."
          ),
      }),
      execute: async ({
        filter,
      }: {
        filter?: string;
      }): Promise<DocumentInfo[]> => {
        const { conditions, params } = buildDocumentFilter(
          filter,
          ctx.userId,
          ctx.collectionId
        );

        const rows = await prisma.$queryRawUnsafe<
          Array<{
            id: string;
            filename: string;
            originalName: string;
            fileSize: number;
            status: string;
            chunkCount: number;
            uploadedAt: Date;
            summary: string | null;
          }>
        >(
          `SELECT d.id, d.filename, d."originalName", d."fileSize", d.status, d."chunkCount", d."uploadedAt", d.summary
           FROM "Document" d
           WHERE ${conditions.join(" AND ")}
           ORDER BY d."uploadedAt" DESC`,
          ...params
        );

        return rows;
      },
    },

    countDocuments: {
      description:
        "Count how many documents match an optional search filter. Use this when the user asks 'how many documents about X?' or 'how many PDFs do I have?'. Returns the exact count from the database. The filter matches against filename and original filename (case-insensitive).",
      inputSchema: z.object({
        filter: z
          .string()
          .optional()
          .describe(
            "Optional search term to filter documents. Use keywords the user mentioned. Leave empty to count all documents."
          ),
      }),
      execute: async ({
        filter,
      }: {
        filter?: string;
      }): Promise<{ count: number; filter: string | null }> => {
        const { conditions, params } = buildDocumentFilter(
          filter,
          ctx.userId,
          ctx.collectionId
        );

        const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
          `SELECT COUNT(*) as count
           FROM "Document" d
           WHERE ${conditions.join(" AND ")}`,
          ...params
        );

        return {
          count: Number(rows[0].count),
          filter: filter ?? null,
        };
      },
    },

    getDocumentContent: {
      description:
        "Get the full text content of a specific document by its ID. Use this when the user asks to read or summarize a specific document, or when you need to see the actual content of a document you found via listDocuments. Returns all text chunks with page numbers.",
      inputSchema: z.object({
        documentId: z
          .string()
          .describe("The ID of the document to retrieve content for."),
      }),
      execute: async ({
        documentId,
      }: {
        documentId: string;
      }): Promise<{
        filename: string;
        chunks: Array<{
          text: string;
          pageNumber: number;
          chunkIndex: number;
        }>;
      }> => {
        // Verify ownership (and collection scope if applicable)
        const conditions: string[] = [
          `d.id = $1`,
          `d."userId" = $2`,
          `d.status = 'completed'`,
        ];
        const params: (string | null)[] = [documentId, ctx.userId];

        if (ctx.collectionId) {
          params.push(ctx.collectionId);
          conditions.push(
            `EXISTS (SELECT 1 FROM "CollectionDocument" cd WHERE cd."documentId" = d.id AND cd."collectionId" = $${params.length})`
          );
        }

        const docRows = await prisma.$queryRawUnsafe<
          Array<{ filename: string }>
        >(
          `SELECT d.filename FROM "Document" d WHERE ${conditions.join(" AND ")}`,
          ...params
        );

        if (docRows.length === 0) {
          throw new Error(
            `Document not found or you don't have access to it.`
          );
        }

        const chunks = await prisma.documentChunk.findMany({
          where: { documentId },
          orderBy: { chunkIndex: "asc" },
          select: { text: true, pageNumber: true, chunkIndex: true },
        });

        return {
          filename: docRows[0].filename,
          chunks,
        };
      },
    },
  };
}
