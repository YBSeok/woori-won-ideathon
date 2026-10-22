import type { ReactNode } from 'react';
import { Badge } from './Badge';

export function ChatBubble({ role, children }: { role: 'ai' | 'user'; children: ReactNode }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-card rounded-br-md bg-primary px-3.5 py-2.5 text-[15px] leading-6 text-white">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%]">
        <div className="mb-1">
          <Badge tone="ai">AI 응답</Badge>
        </div>
        <div className="rounded-card rounded-tl-md bg-surface px-3.5 py-2.5 text-[15px] leading-6 text-textStrong shadow-card">
          {children}
        </div>
      </div>
    </div>
  );
}
