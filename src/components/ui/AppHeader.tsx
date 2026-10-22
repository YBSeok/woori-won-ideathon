import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';

export function AppHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-surface px-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로 가기"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-textStrong focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <ChevronLeft size={22} aria-hidden />
        </button>
      ) : (
        <span className="w-11" />
      )}
      <h1 className="min-w-0 flex-1 truncate text-center text-[17px] font-bold text-textStrong">{title}</h1>
      <div className="flex w-11 items-center justify-end">{right}</div>
    </header>
  );
}
