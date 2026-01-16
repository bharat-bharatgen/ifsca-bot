/**
 * Chat API Route Handler
 *
 * Handles chat requests with RAG-augmented responses.
 * Features:
 * - LightRAG context retrieval
 * - Langfuse observability
 * - Streaming responses via Vercel AI SDK
 * - Real-time progress tracking
 */

import { streamText, convertToCoreMessages, StreamData } from 'ai';
import { getChatModel } from '@/lib/llm-provider';
import { buildSystemPrompt, getCurrentPromptVersion } from '@/lib/prompts';
import { getLangfuse } from '@/lib/langfuse-client';
import { retrieveRAGContext, RAGSpan } from '@/lib/rag-retriever';
import { API_CONFIG, LLM_CONFIG, ERROR_MESSAGES, CONTEXT_TEMPLATES } from '@/lib/config';
import { PROGRESS_MESSAGES, type ProgressStep } from '@/lib/progress-stream';
import type { ChatMessage } from '@/lib/types';
import type { LangfuseSpanClient } from 'langfuse';

type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

interface ProgressDataOptions {
  detail?: string;
  durationMs?: number;
  metadata?: { [key: string]: JSONValue };
}

/**
 * Helper to create progress data for StreamData
 */
function createProgressData(
  step: ProgressStep,
  options?: ProgressDataOptions
): JSONValue {
  const data: { [key: string]: JSONValue } = {
    type: 'progress',
    step,
    message: PROGRESS_MESSAGES[step],
  };

  if (options?.detail) data.detail = options.detail;
  if (options?.durationMs !== undefined) data.durationMs = options.durationMs;
  if (options?.metadata) data.metadata = options.metadata;

  return data;
}

/**
 * Wrap Langfuse span to match RAGSpan interface
 */
function wrapLangfuseSpan(span: LangfuseSpanClient | undefined): RAGSpan | null {
  if (!span) return null;
  return {
    event: (params) => span.event(params),
    end: (params) => span.end(params),
  };
}

// Next.js API route configuration
export const maxDuration = API_CONFIG.maxDuration;

/**
 * Extract the latest user message from the conversation
 */
function getLatestUserMessage(messages: ChatMessage[]): ChatMessage | undefined {
  return messages.filter((m) => m.role === 'user').pop();
}

/**
 * Build augmented messages array with system prompt and RAG context
 */
function buildAugmentedMessages(
  systemPrompt: string,
  ragContext: string,
  messages: ChatMessage[]
): ChatMessage[] {
  const augmented: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
  ];

  if (ragContext) {
    augmented.push({
      role: 'system',
      content: CONTEXT_TEMPLATES.ragContext(ragContext),
    });
  }

  return [...augmented, ...messages];
}

/**
 * Create JSON error response
 */
function createErrorResponse(message: string, status: number): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * POST /api/chat
 *
 * Process chat messages with RAG context and return streaming response
 */
export async function POST(req: Request): Promise<Response> {
  // Initialize Langfuse tracing
  const langfuse = getLangfuse();
  const promptVersion = getCurrentPromptVersion();

  const trace = langfuse?.trace({
    name: 'ifsca-chat',
    metadata: {
      promptVersion,
    },
  });

  // Initialize StreamData for progress events
  const streamData = new StreamData();
  const pipelineStartTime = Date.now();

  try {
    // Parse request body
    const { messages } = await req.json() as { messages: ChatMessage[] };

    // Validate user message exists
    const latestUserMessage = getLatestUserMessage(messages);
    if (!latestUserMessage) {
      trace?.update({ output: ERROR_MESSAGES.NO_USER_MESSAGE, metadata: { error: true } });
      streamData.close();
      return createErrorResponse(ERROR_MESSAGES.NO_USER_MESSAGE, 400);
    }

    // Log input to trace
    trace?.update({ input: latestUserMessage.content });

    // Send RAG start progress event
    streamData.append(createProgressData('rag_start'));
    const ragStartTime = Date.now();

    // Retrieve RAG context
    const ragSpan = trace?.span({
      name: 'rag-retrieval',
      input: latestUserMessage.content,
    });

    const ragResult = await retrieveRAGContext(latestUserMessage.content, wrapLangfuseSpan(ragSpan));

    // Send RAG complete progress event with timing
    const ragDurationMs = Date.now() - ragStartTime;
    streamData.append(createProgressData('rag_complete', {
      durationMs: ragDurationMs,
      detail: `Context: ${Math.round(ragResult.metadata.totalContextLength / 1000)}k chars`,
      metadata: { contextLength: ragResult.metadata.totalContextLength },
    }));

    // Build system prompt and augmented messages
    const systemPrompt = buildSystemPrompt();
    const augmentedMessages = buildAugmentedMessages(
      systemPrompt,
      ragResult.context,
      messages
    );

    // Create generation span for LLM call
    const generation = trace?.generation({
      name: 'llm-generation',
      model: process.env.VLLM_CHAT_MODEL || LLM_CONFIG.defaultModel,
      input: augmentedMessages,
      modelParameters: {
        temperature: LLM_CONFIG.temperature,
        maxTokens: LLM_CONFIG.maxTokens,
      },
    });

    // Send LLM start progress event
    streamData.append(createProgressData('llm_start'));
    const llmStartTime = Date.now();
    let hasStartedStreaming = false;

    // Stream response from LLM
    const result = streamText({
      model: getChatModel(),
      messages: convertToCoreMessages(augmentedMessages),
      temperature: LLM_CONFIG.temperature,
      maxTokens: LLM_CONFIG.maxTokens,
      onChunk: () => {
        // Send streaming progress event on first chunk
        if (!hasStartedStreaming) {
          hasStartedStreaming = true;
          streamData.append(createProgressData('llm_streaming', {
            durationMs: Date.now() - llmStartTime,
            detail: 'First token received',
          }));
        }
      },
      onFinish: async ({ text, usage }) => {
        // Send complete progress event with total timing
        const totalDurationMs = Date.now() - pipelineStartTime;
        streamData.append(createProgressData('complete', {
          durationMs: totalDurationMs,
          metadata: {
            ragDurationMs,
            llmDurationMs: Date.now() - llmStartTime,
            promptTokens: usage?.promptTokens,
            completionTokens: usage?.completionTokens,
          },
        }));
        streamData.close();

        // Log completion to Langfuse
        generation?.end({
          output: text,
          usage: {
            input: usage?.promptTokens,
            output: usage?.completionTokens,
            total: usage?.totalTokens,
          },
        });

        trace?.update({
          output: text,
          metadata: {
            promptTokens: usage?.promptTokens,
            completionTokens: usage?.completionTokens,
            totalTokens: usage?.totalTokens,
            ragContextLength: ragResult.metadata.totalContextLength,
            ...ragResult.metadata,
          },
        });

        // Flush to ensure data is sent
        await langfuse?.flushAsync();
      },
    });

    return result.toDataStreamResponse({ data: streamData });

  } catch (error) {
    console.error('Chat API error:', error);

    // Close stream data on error
    streamData.close();

    trace?.update({
      metadata: { error: true, errorMessage: error instanceof Error ? error.message : String(error) },
    });

    await langfuse?.flushAsync();

    return createErrorResponse(ERROR_MESSAGES.CHAT_FAILED, 500);
  }
}
