import { Langfuse } from 'langfuse';

/**
 * Langfuse client for LLM observability and tracing
 *
 * Provides:
 * - Request/response tracing
 * - Token usage tracking
 * - Latency monitoring
 * - RAG context logging
 * - Error tracking
 */

// Initialize Langfuse client (singleton)
let langfuseInstance: Langfuse | null = null;

export function getLangfuse(): Langfuse | null {
  // Check if Langfuse is enabled
  if (process.env.LANGFUSE_ENABLED === 'false') {
    return null;
  }

  if (!langfuseInstance) {
    const secretKey = process.env.LANGFUSE_SECRET_KEY;
    const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
    const baseUrl = process.env.LANGFUSE_BASE_URL || 'http://localhost:3000';

    if (!secretKey || !publicKey) {
      console.warn('Langfuse keys not configured. Tracing disabled.');
      return null;
    }

    langfuseInstance = new Langfuse({
      secretKey,
      publicKey,
      baseUrl,
    });
  }

  return langfuseInstance;
}

/**
 * Create a trace for a chat request
 */
export function createChatTrace(params: {
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}) {
  const langfuse = getLangfuse();
  if (!langfuse) return null;

  return langfuse.trace({
    name: 'ifsca-chat',
    userId: params.userId,
    sessionId: params.sessionId,
    metadata: params.metadata,
  });
}

/**
 * Flush all pending events (call on shutdown or after request)
 */
export async function flushLangfuse(): Promise<void> {
  const langfuse = getLangfuse();
  if (langfuse) {
    await langfuse.flushAsync();
  }
}
