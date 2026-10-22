import type { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { ProgressSteps } from './ProgressSteps';

export function Screen({
  title,
  onBack,
  step,
  children,
  footer,
  overlay,
}: {
  title: string;
  onBack?: () => void;
  step?: 1 | 2 | 3 | 4 | 5;
  children: ReactNode;
  footer?: ReactNode;
  overlay?: ReactNode;
}) {
  return (
    <div className="relative flex h-full min-h-0 flex-col bg-bg">
      <AppHeader title={title} onBack={onBack} />
      {step ? (
        <div className="shrink-0 border-b border-line bg-surface px-3 py-2">
          <ProgressSteps current={step} />
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      {footer ? (
        <div className="shrink-0 space-y-2 border-t border-line bg-surface px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          {footer}
        </div>
      ) : null}
      {overlay}
    </div>
  );
}
