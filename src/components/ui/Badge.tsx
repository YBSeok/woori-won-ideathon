import type { ReactNode } from 'react';
import { cn } from '../../lib/format';

type BadgeTone = 'ai' | 'example' | 'safe' | 'caution' | 'danger' | 'neutral';

const toneClass: Record<BadgeTone, string> = {
  ai: 'bg-primary/10 text-primary',
  example: 'bg-caution/15 text-cautionText',
  safe: 'bg-success/10 text-successText',
  caution: 'bg-caution/15 text-cautionText',
  danger: 'bg-danger/10 text-dangerText',
  neutral: 'bg-bg text-textBody',
};

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-chip px-2 py-0.5 text-[11px] font-semibold leading-4',
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ExampleBadge() {
  return <Badge tone="example">예시</Badge>;
}
