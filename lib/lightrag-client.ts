export interface LightRAGQueryParams {
  query: string;
  mode?: 'local' | 'global' | 'hybrid' | 'naive' | 'mix';
  only_need_context?: boolean;
  include_references?: boolean;
  top_k?: number;
  top_chunk_k?: number;
  max_token_for_entity?: number;
  max_token_for_relation?: number;
  max_token_for_global_context?: number;
  similarity_threshold?: number;
  enable_rerank?: boolean;
}

export interface LightRAGSpan {
  event: (params: { name: string; metadata?: unknown; level?: 'ERROR' | 'WARNING' | 'DEBUG' | 'DEFAULT' }) => void;
}

export interface LightRAGReference {
  reference_id: string;
  file_path: string;
  content?: string;
}

export interface LightRAGResponse {
  response: string;
  references?: LightRAGReference[];
}

export interface LightRAGQueryLog {
  timestamp: string;
  query: string;
  config: {
    mode: string;
    only_need_context: boolean;
    top_k?: number;
    chunk_top_k?: number;
    max_token_for_text_unit?: number;
    max_token_for_local_context?: number;
    max_token_for_global_context?: number;
  };
  response: {
    status: number;
    latencyMs: number;
    responseLength: number;
    success: boolean;
    error?: string;
  };
}

export class LightRAGClient {
  private baseUrl: string;
  private apiKey?: string;
  private enableLogging: boolean;

  constructor() {
    this.baseUrl = process.env.LIGHTRAG_BASE_URL || 'http://localhost:9621';
    this.apiKey = process.env.LIGHTRAG_API_KEY;
    this.enableLogging = process.env.LIGHTRAG_LOGGING !== 'false';
  }

  private log(logEntry: LightRAGQueryLog): void {
    if (!this.enableLogging) return;

    console.log('[LightRAG Query]', JSON.stringify(logEntry, null, 2));
  }

  async query(params: LightRAGQueryParams, span?: LightRAGSpan | null): Promise<LightRAGResponse> {
    const startTime = Date.now();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const mode = params.mode || process.env.LIGHTRAG_QUERY_MODE || 'hybrid';
    const only_need_context = params.only_need_context ?? false;

    const body: Record<string, unknown> = {
      query: params.query,
      mode,
      only_need_context,
    };

    // Only add optional parameters if provided
    if (params.top_k !== undefined) body.top_k = params.top_k;
    if (params.top_chunk_k !== undefined) body.chunk_top_k = params.top_chunk_k;
    if (params.max_token_for_entity !== undefined) body.max_token_for_text_unit = params.max_token_for_entity;
    if (params.max_token_for_relation !== undefined) body.max_token_for_local_context = params.max_token_for_relation;
    if (params.max_token_for_global_context !== undefined) body.max_token_for_global_context = params.max_token_for_global_context;
    if (params.enable_rerank !== undefined) body.enable_rerank = params.enable_rerank;

    // Build config object for logging
    const config: LightRAGQueryLog['config'] = {
      mode,
      only_need_context,
      ...(params.top_k !== undefined && { top_k: params.top_k }),
      ...(params.top_chunk_k !== undefined && { chunk_top_k: params.top_chunk_k }),
      ...(params.max_token_for_entity !== undefined && { max_token_for_text_unit: params.max_token_for_entity }),
      ...(params.max_token_for_relation !== undefined && { max_token_for_local_context: params.max_token_for_relation }),
      ...(params.max_token_for_global_context !== undefined && { max_token_for_global_context: params.max_token_for_global_context }),
    };

    // Log query config to Langfuse span
    span?.event({
      name: 'lightrag-query-request',
      metadata: {
        ...config,
        enable_rerank: params.enable_rerank,
        baseUrl: this.baseUrl,
      },
    });

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.log({
        timestamp: new Date().toISOString(),
        query: params.query.substring(0, 200) + (params.query.length > 200 ? '...' : ''),
        config,
        response: {
          status: 0,
          latencyMs,
          responseLength: 0,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      this.log({
        timestamp: new Date().toISOString(),
        query: params.query.substring(0, 200) + (params.query.length > 200 ? '...' : ''),
        config,
        response: {
          status: response.status,
          latencyMs,
          responseLength: 0,
          success: false,
          error: `${response.statusText}: ${errorText}`,
        },
      });
      // Log error to Langfuse span
      span?.event({
        name: 'lightrag-query-error',
        level: 'ERROR',
        metadata: {
          status: response.status,
          latencyMs,
          error: `${response.statusText}: ${errorText.substring(0, 500)}`,
        },
      });
      throw new Error(`LightRAG query failed: ${response.statusText}`);
    }

    const result: LightRAGResponse = await response.json();

    this.log({
      timestamp: new Date().toISOString(),
      query: params.query.substring(0, 200) + (params.query.length > 200 ? '...' : ''),
      config,
      response: {
        status: response.status,
        latencyMs,
        responseLength: result.response?.length || 0,
        success: true,
      },
    });

    // Log successful response to Langfuse span
    span?.event({
      name: 'lightrag-query-response',
      metadata: {
        status: response.status,
        latencyMs,
        responseLength: result.response?.length || 0,
        success: true,
      },
    });

    return result;
  }

  // Get only context without LLM response (useful for RAG pipeline)
  async getContext(query: string): Promise<string> {
    const result = await this.query({
      query,
      only_need_context: true,
      mode: 'hybrid',
    });
    return result.response;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const lightragClient = new LightRAGClient();
