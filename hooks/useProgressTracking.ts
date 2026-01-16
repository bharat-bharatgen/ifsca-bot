import { useMemo } from 'react';
import type { ThinkingStep } from '@/components/chat/ThinkingPanel';
import type { ProgressStep } from '@/lib/progress-stream';

interface ProgressData {
  type: 'progress';
  step: ProgressStep;
  message: string;
  detail?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Map progress steps to thinking step IDs
 */
const STEP_ORDER: ProgressStep[] = ['rag_start', 'rag_complete', 'llm_start', 'llm_streaming', 'complete'];

/**
 * Parse stream data into ThinkingStep objects for the ThinkingPanel
 */
export function useProgressTracking(data: unknown[] | undefined, isLoading: boolean) {
  return useMemo(() => {
    // Filter to only progress events
    const progressEvents = (data || []).filter(
      (item): item is ProgressData =>
        typeof item === 'object' &&
        item !== null &&
        'type' in item &&
        (item as Record<string, unknown>).type === 'progress'
    );

    if (progressEvents.length === 0) {
      return {
        steps: [] as ThinkingStep[],
        isThinking: false,
        totalDurationMs: undefined,
      };
    }

    // Build steps from progress events
    const steps: ThinkingStep[] = [];
    let totalDurationMs: number | undefined;
    let lastCompletedStep: ProgressStep | null = null;

    for (const event of progressEvents) {
      const stepIndex = STEP_ORDER.indexOf(event.step);

      // Determine status based on step type and subsequent events
      let status: ThinkingStep['status'] = 'pending';

      if (event.step === 'complete') {
        totalDurationMs = event.durationMs;
        continue; // Don't add complete as a visible step
      }

      // Check if this step has completed (next step exists or we have its duration)
      const hasNextStep = progressEvents.some(
        (e) => STEP_ORDER.indexOf(e.step) > stepIndex
      );

      if (hasNextStep || event.durationMs) {
        status = 'complete';
        lastCompletedStep = event.step;
      } else if (isLoading) {
        status = 'in_progress';
      }

      // Only add meaningful steps
      if (event.step === 'rag_start' || event.step === 'llm_start') {
        // These are start markers - we'll use the complete events for display
        continue;
      }

      // Map to user-friendly step representation
      if (event.step === 'rag_complete') {
        steps.push({
          id: 'rag',
          status,
          message: 'Search IFSCA documents',
          detail: event.detail,
          durationMs: event.durationMs,
        });
      } else if (event.step === 'llm_streaming') {
        steps.push({
          id: 'llm',
          status,
          message: 'Generate response',
          detail: event.detail,
          durationMs: event.durationMs,
        });
      }
    }

    // Add pending steps if we're still processing
    const hasRagStep = steps.some((s) => s.id === 'rag');
    const hasLlmStep = steps.some((s) => s.id === 'llm');

    if (isLoading && progressEvents.length > 0) {
      if (!hasRagStep) {
        steps.unshift({
          id: 'rag',
          status: 'in_progress',
          message: 'Search IFSCA documents',
        });
      }
      if (!hasLlmStep && hasRagStep) {
        steps.push({
          id: 'llm',
          status: steps.find((s) => s.id === 'rag')?.status === 'complete' ? 'in_progress' : 'pending',
          message: 'Generate response',
        });
      }
    }

    // Determine if we're still thinking
    const isThinking = isLoading && !progressEvents.some((e) => e.step === 'complete');

    return {
      steps,
      isThinking,
      totalDurationMs,
    };
  }, [data, isLoading]);
}
