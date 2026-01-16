'use client';

import { useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { useProgressTracking } from '@/hooks/useProgressTracking';

export default function ChatPage() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop,
    data,
    append,
  } = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  const progressTracking = useProgressTracking(data, isLoading);

  // Handle clicking on a sample question
  const handleQuestionClick = useCallback((question: string) => {
    append({ role: 'user', content: question });
  }, [append]);

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      {/* Header - minimal like ChatGPT */}
      <header className="flex-shrink-0 border-b border-gray-200/50 bg-white">
        <div className="flex items-center justify-between h-12 sm:h-14 px-3 sm:px-4 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src="/bharatgen-logo1.png"
              alt="BharatGen"
              className="h-6 sm:h-8 w-auto"
            />
            <span className="text-sm sm:text-base font-semibold text-gray-800">
              IFSCA Assistant
            </span>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Messages Area - scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            progressTracking={progressTracking}
            onQuestionClick={handleQuestionClick}
          />

          {error && (
            <div className="mx-4 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{error.message}</p>
              <button
                onClick={() => reload()}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Input Area - fixed at bottom */}
      <footer className="flex-shrink-0 bg-white pb-3 sm:pb-4 pt-2 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-3xl mx-auto w-full px-3 sm:px-4">
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            onStop={stop}
          />
          <p className="text-[10px] sm:text-xs text-center text-gray-400 mt-2">
            IFSCA Assistant can make mistakes. Verify important information.
          </p>
        </div>
      </footer>
    </div>
  );
}
