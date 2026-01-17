/**
 * RAG Retriever Module
 *
 * Handles all RAG context retrieval logic including:
 * - Primary query execution
 * - Secondary contextual queries (milestones, fees)
 * - Context truncation and formatting
 */

import { lightragClient, LightRAGQueryParams } from './lightrag-client';

// Configuration
export const RAG_CONFIG = {
  maxContextLength: 50000,  // Reduced for lower latency
  queryMode: 'hybrid' as const,
  truncationMessage: '\n\n[Context truncated...]',
};

// Query patterns for secondary context retrieval
export const QUERY_PATTERNS = {
  milestone: {
    keywords: ['milestone', 'disbursement', 'grant', 'm1', 'm2', 'listing support'],
    query: 'FAQs on Milestones grant disbursement M1 M2 Listing Support Grant Draft Offer Document successful listing',
    contextPrefix: '\n\n--- Additional Milestone Context ---\n',
  },
  fee: {
    keywords: ['fee', 'cost', 'expensive', 'application fee', 'authorization fee'],
    query: 'Fee structure USD application fee authorization fee foreign domestic sandbox Annexure-VIII FE Framework',
    contextPrefix: '\n\n--- Additional Fee Context ---\n',
  },
};

export interface RAGResult {
  context: string;
  metadata: {
    primaryContextLength: number;
    totalContextLength: number;
    isMilestoneQuestion: boolean;
    isFeeQuestion: boolean;
    latencyMs: number;
    truncated: boolean;
    queryMode: string;
    lightragBaseUrl: string;
  };
}

export interface RAGSpan {
  event: (params: { name: string; metadata?: unknown; level?: 'ERROR' | 'WARNING' | 'DEBUG' | 'DEFAULT' }) => void;
  end: (params: { output?: string; metadata?: unknown; level?: 'ERROR' | 'WARNING' | 'DEBUG' | 'DEFAULT'; statusMessage?: string }) => void;
}

/**
 * Check if query matches any keywords in a pattern
 */
function matchesPattern(query: string, keywords: string[]): boolean {
  const lowerQuery = query.toLowerCase();
  return keywords.some(keyword => lowerQuery.includes(keyword));
}

/**
 * Execute a RAG query with error handling
 */
async function executeQuery(query: string, span?: RAGSpan | null): Promise<string> {

  // Query configuration (separate from the query text itself)
  // Using only_need_context: true to get raw context, letting our LLM with document priority rules synthesize
  const ragQuery: LightRAGQueryParams = {
    query,
    mode: RAG_CONFIG.queryMode,
    only_need_context: true,
    top_k: 5,
    top_chunk_k: 20,
    max_token_for_entity: 6000,
    max_token_for_relation: 8000,
    max_token_for_global_context: 30000,
    enable_rerank: false,
  };

  // Pass span to lightragClient for Langfuse logging
  const response = await lightragClient.query(ragQuery, span);
  return response.response || '';
}

/**
 * Truncate context if it exceeds max length
 */
function truncateContext(context: string): { context: string; truncated: boolean } {
  if (context.length > RAG_CONFIG.maxContextLength) {
    return {
      context: context.substring(0, RAG_CONFIG.maxContextLength) + RAG_CONFIG.truncationMessage,
      truncated: true,
    };
  }
  return { context, truncated: false };
}

/**
 * Retrieve RAG context for a user query
 */
export async function retrieveRAGContext(
  userQuery: string,
  span?: RAGSpan | null
): Promise<RAGResult> {
  const startTime = Date.now();
  let context = '';
  let primaryContextLength = 0;

  // Determine query types
  const isMilestoneQuestion = false && matchesPattern(userQuery, QUERY_PATTERNS.milestone.keywords);
  const isFeeQuestion = false && matchesPattern(userQuery, QUERY_PATTERNS.fee.keywords);

  try {
    // Primary RAG query
    context = await executeQuery(userQuery, span);
    primaryContextLength = context.length;

    span?.event({
      name: 'primary-rag-complete',
      metadata: {
        contextLength: primaryContextLength,
        latencyMs: Date.now() - startTime,
      },
    });

    // Secondary milestone query
    if (isMilestoneQuestion) {
      try {
        const additionalContext = await executeQuery(QUERY_PATTERNS.milestone.query, span);
        if (additionalContext) {
          context += QUERY_PATTERNS.milestone.contextPrefix + additionalContext;
        }
        span?.event({
          name: 'milestone-rag-complete',
          metadata: { additionalContextLength: additionalContext.length },
        });
      } catch (error) {
        console.error('Secondary milestone query error:', error);
        span?.event({ name: 'milestone-rag-error', level: 'WARNING' });
      }
    }

    // Secondary fee query
    if (isFeeQuestion) {
      try {
        const additionalContext = await executeQuery(QUERY_PATTERNS.fee.query, span);
        if (additionalContext) {
          context += QUERY_PATTERNS.fee.contextPrefix + additionalContext;
        }
        span?.event({
          name: 'fee-rag-complete',
          metadata: { additionalContextLength: additionalContext.length },
        });
      } catch (error) {
        console.error('Secondary fee query error:', error);
        span?.event({ name: 'fee-rag-error', level: 'WARNING' });
      }
    }

    // Truncate if necessary
    const { context: finalContext, truncated } = truncateContext(context);

    const result: RAGResult = {
      context: finalContext,
      metadata: {
        primaryContextLength,
        totalContextLength: finalContext.length,
        isMilestoneQuestion,
        isFeeQuestion,
        latencyMs: Date.now() - startTime,
        truncated,
        queryMode: RAG_CONFIG.queryMode,
        lightragBaseUrl: process.env.LIGHTRAG_BASE_URL || 'http://localhost:9621',
      },
    };

    span?.end({
      output: `Retrieved ${result.metadata.totalContextLength} characters of context`,
      metadata: result.metadata,
    });

    return result;

  } catch (error) {
    console.error('LightRAG query error:', error);
    span?.end({
      level: 'ERROR',
      statusMessage: String(error),
    });

    return {
      context: '',
      metadata: {
        primaryContextLength: 0,
        totalContextLength: 0,
        isMilestoneQuestion,
        isFeeQuestion,
        latencyMs: Date.now() - startTime,
        truncated: false,
        queryMode: RAG_CONFIG.queryMode,
        lightragBaseUrl: process.env.LIGHTRAG_BASE_URL || 'http://localhost:9621',
      },
    };
  }
}
