import { Message } from '@ai-sdk/react';
import { useEffect, useRef, useState, useMemo } from 'react';
import { MessageItem } from './MessageItem';
import { ThinkingPanel, type ThinkingStep } from './ThinkingPanel';
import { SAMPLE_QUESTIONS } from '@/lib/sample-questions';

interface ProgressTracking {
  steps: ThinkingStep[];
  isThinking: boolean;
  totalDurationMs?: number;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  progressTracking?: ProgressTracking;
  onQuestionClick?: (question: string) => void;
}

interface WelcomeScreenProps {
  onQuestionClick?: (question: string) => void;
}

function WelcomeScreen({ onQuestionClick }: WelcomeScreenProps) {
  // Get 4 random questions on mount (client-side only)
  const [randomQuestions, setRandomQuestions] = useState<typeof SAMPLE_QUESTIONS>([]);

  useEffect(() => {
    const shuffled = [...SAMPLE_QUESTIONS].sort(() => Math.random() - 0.5);
    setRandomQuestions(shuffled.slice(0, 4));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-emerald-600 flex items-center justify-center mb-4 sm:mb-6">
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>

      <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 text-center">
        How can I help you today?
      </h1>
      <p className="text-sm sm:text-base text-gray-500 mb-2 text-center max-w-md">
        Ask me anything about IFSCA regulations, guidelines, and compliance requirements.
      </p>
      <p className="text-xs text-gray-400 mb-6 sm:mb-8 text-center flex items-center justify-center gap-1.5">
        Powered by
        <span className="flex items-center gap-1">
          <img src="/bharatgen-logo.png" alt="BharatGen" className="h-3 w-auto" />
          <span className="font-semibold text-[#1a5694]">BharatGen</span>
        </span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-2xl">
        {randomQuestions.map((item) => (
          <button
            key={item.id}
            onClick={() => onQuestionClick?.(item.question)}
            className="flex flex-col items-start p-3 sm:p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-left group"
          >
            <span className="font-medium text-xs text-gray-400 group-hover:text-gray-500 mb-1">
              {item.category}
            </span>
            <span className="text-sm text-gray-700 group-hover:text-gray-900 line-clamp-2">
              {item.question}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Loading indicator component
function LoadingIndicator() {
  return (
    <div className="py-4 sm:py-6 bg-gray-50/50">
      <div className="max-w-3xl mx-auto px-3 sm:px-4">
        <div className="flex gap-3 sm:gap-4">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm text-gray-800 mb-2">IFSCA Assistant</div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MessageList({ messages, isLoading, progressTracking, onQuestionClick }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const lastMessage = messages[messages.length - 1];
  const isStreaming = isLoading && lastMessage?.role === 'assistant';
  const showLoading = isLoading && (!lastMessage || lastMessage.role === 'user');

  // Thinking panel disabled
  const showThinkingPanel = false;

  return (
    <div className="min-h-full">
      {messages.length === 0 ? (
        <WelcomeScreen onQuestionClick={onQuestionClick} />
      ) : (
        <>
          {messages.map((message, index) => {
            const isLastAssistant = index === messages.length - 1 && message.role === 'assistant';

            return (
              <div key={message.id}>
                {isLastAssistant && showThinkingPanel && progressTracking && (
                  <ThinkingPanel
                    steps={progressTracking.steps}
                    isThinking={progressTracking.isThinking}
                    totalDurationMs={progressTracking.totalDurationMs}
                  />
                )}
                <MessageItem
                  message={message}
                  isStreaming={isStreaming && isLastAssistant}
                />
              </div>
            );
          })}

          {showLoading && <LoadingIndicator />}
        </>
      )}

      <div ref={messagesEndRef} className="h-4" />
    </div>
  );
}
