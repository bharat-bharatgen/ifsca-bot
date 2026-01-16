// Message Types
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id?: string;
  role: MessageRole;
  content: string;
  timestamp?: Date;
  references?: Array<{
    id: string;
    source: string;
    content?: string;
  }>;
}

export interface RAGContext {
  context: string;
  sources: string[];
}

// API Request/Response Types
export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatErrorResponse {
  error: string;
}

// Langfuse Types
export interface LangfuseTrace {
  update: (params: {
    input?: string;
    output?: string;
    level?: string;
    statusMessage?: string;
    metadata?: Record<string, unknown>;
  }) => void;
  span: (params: { name: string; input?: string }) => LangfuseSpan | undefined;
  generation: (params: {
    name: string;
    model: string;
    input: unknown;
    modelParameters: Record<string, unknown>;
  }) => LangfuseGeneration | undefined;
}

export interface LangfuseSpan {
  event: (params: { name: string; metadata?: Record<string, unknown>; level?: string }) => void;
  end: (params: {
    output?: string;
    metadata?: Record<string, unknown>;
    level?: string;
    statusMessage?: string;
  }) => void;
}

export interface LangfuseGeneration {
  end: (params: {
    output: string;
    usage?: {
      input?: number;
      output?: number;
      total?: number;
    };
  }) => void;
}
