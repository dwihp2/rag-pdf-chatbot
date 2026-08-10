import { UIMessage } from 'ai';

// RAG source type (streamed as data part)
export interface AppSource {
  id: string;
  documentId: string;
  filename: string;
  page: number;
  snippet: string;
  score: number;
}

// Custom UI message with source data parts
export type MyUIMessage = UIMessage<
  never,
  {
    sources: {
      sources: AppSource[];
    };
    notification: {
      message: string;
      level: 'info' | 'warning' | 'error';
    };
  }
>;

// API input types
export interface CreateChatInput {
  title?: string;
  collectionId?: string;
}

export interface CreateDocumentInput {
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  collectionId?: string;
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
}
