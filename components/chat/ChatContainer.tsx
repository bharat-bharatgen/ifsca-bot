import { ReactNode } from 'react';

interface ChatContainerProps {
  children: ReactNode;
}

export function ChatContainer({ children }: ChatContainerProps) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      {children}
    </div>
  );
}
