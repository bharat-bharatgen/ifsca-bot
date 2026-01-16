import { useState } from 'react';
import { clsx } from 'clsx';

export interface ThinkingStep {
  id: string;
  status: 'pending' | 'in_progress' | 'complete' | 'error';
  message: string;
  detail?: string;
  durationMs?: number;
}

interface ThinkingPanelProps {
  steps: ThinkingStep[];
  isThinking: boolean;
  totalDurationMs?: number;
}

export function ThinkingPanel({ steps, isThinking, totalDurationMs }: ThinkingPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (steps.length === 0) return null;

  const currentStep = steps.find(s => s.status === 'in_progress');
  const completedSteps = steps.filter(s => s.status === 'complete').length;
  const totalSteps = steps.length;

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={clsx(
          'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
          'bg-gray-50 hover:bg-gray-100 border border-gray-200',
          isThinking && 'border-blue-200 bg-blue-50'
        )}
      >
        <div className="flex items-center space-x-2">
          <span className={clsx(
            'transition-transform duration-200',
            isExpanded ? 'rotate-90' : 'rotate-0'
          )}>
            ▶
          </span>

          {isThinking ? (
            <span className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-blue-700 font-medium">
                {currentStep?.message || 'Thinking...'}
              </span>
            </span>
          ) : (
            <span className="text-gray-600 font-medium">
              Thought for {totalDurationMs ? formatDuration(totalDurationMs) : '...'}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-gray-500">
          {!isThinking && (
            <span className="text-xs">
              {completedSteps}/{totalSteps} steps
            </span>
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm">
          <div className="space-y-1.5">
            {steps.map((step) => (
              <div key={step.id} className="flex items-start space-x-2">
                <span className="flex-shrink-0 mt-0.5">
                  {step.status === 'complete' && (
                    <span className="text-green-500">✓</span>
                  )}
                  {step.status === 'in_progress' && (
                    <span className="text-blue-500 animate-pulse">→</span>
                  )}
                  {step.status === 'pending' && (
                    <span className="text-gray-300">○</span>
                  )}
                  {step.status === 'error' && (
                    <span className="text-red-500">✗</span>
                  )}
                </span>

                <div className="flex-1 min-w-0">
                  <div className={clsx(
                    'flex items-center justify-between',
                    step.status === 'complete' && 'text-gray-600',
                    step.status === 'in_progress' && 'text-blue-700 font-medium',
                    step.status === 'pending' && 'text-gray-400',
                    step.status === 'error' && 'text-red-600'
                  )}>
                    <span className="truncate">{step.message}</span>
                    {step.durationMs && (
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        {formatDuration(step.durationMs)}
                      </span>
                    )}
                  </div>
                  {step.detail && (
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {step.detail}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
