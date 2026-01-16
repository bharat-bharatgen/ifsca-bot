import { Message } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
}

// User avatar component
function UserAvatar() {
  return (
    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
}

// Assistant avatar component
function AssistantAvatar() {
  return (
    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    </div>
  );
}

export function MessageItem({ message, isStreaming = false }: MessageItemProps) {
  const isUser = message.role === 'user';
  const isAssistantStreaming = !isUser && isStreaming;

  return (
    <div className={`py-4 sm:py-6 ${isUser ? 'bg-white' : 'bg-gray-50/50'}`}>
      <div className="max-w-3xl mx-auto px-3 sm:px-4">
        <div className="flex gap-3 sm:gap-4">
          {/* Avatar */}
          <div className="mt-0.5">
            {isUser ? <UserAvatar /> : <AssistantAvatar />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-gray-800 mb-1">
              {isUser ? 'You' : 'IFSCA Assistant'}
            </div>

            {isUser ? (
              <div className="text-gray-800 text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
            ) : (
              <div className="prose prose-sm sm:prose-base max-w-none text-gray-800 prose-p:my-2 prose-p:leading-relaxed prose-headings:my-3 prose-headings:font-semibold prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-code:text-pink-600 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-table:border-collapse prose-table:w-full prose-table:text-sm prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-td:border prose-td:border-gray-300 prose-td:px-3 prose-td:py-2 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                {isAssistantStreaming && (
                  <span className="inline-block w-2 h-5 ml-0.5 bg-gray-400 animate-pulse rounded-sm" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
