/**
 * Progress Stream Utilities
 *
 * Handles sending progress events alongside the LLM stream
 */

export type ProgressStep =
  | 'rag_start'
  | 'rag_complete'
  | 'llm_start'
  | 'llm_streaming'
  | 'complete';

export interface ProgressEvent {
  type: 'progress';
  step: ProgressStep;
  message: string;
  detail?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

export interface ContentEvent {
  type: 'content';
  content: string;
}

export type StreamEvent = ProgressEvent | ContentEvent;

/**
 * Encode a progress event for streaming
 */
export function encodeProgressEvent(event: ProgressEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

/**
 * Create a progress event
 */
export function createProgressEvent(
  step: ProgressStep,
  message: string,
  options?: { detail?: string; durationMs?: number; metadata?: Record<string, unknown> }
): ProgressEvent {
  return {
    type: 'progress',
    step,
    message,
    ...options,
  };
}

/**
 * Progress messages for each step
 */
export const PROGRESS_MESSAGES: Record<ProgressStep, string> = {
  rag_start: 'Searching IFSCA documents...',
  rag_complete: 'Retrieved relevant passages',
  llm_start: 'Analyzing and generating response...',
  llm_streaming: 'Generating response...',
  complete: 'Complete',
};
