-- ivfflat index for vector similarity search on document chunks
CREATE INDEX IF NOT EXISTS "DocumentChunk_embedding_idx" ON "DocumentChunk" USING ivfflat ("embedding" vector_cosine_ops);
