import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

export function ListItem({
  title,
  description,
  right,
  onClick,
}: {
  title: string;
  description?: string;
  right?: ReactNode;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-[15px] font-semibold text-textStrong">{title}</span>
        {description ? <span className="mt-0.5 block text-[13px] text-textBody">{description}</span> : null}
      </span>
      {right ?? (onClick ? <ChevronRight size={18} className="text-textWeak" aria-hidden /> : null)}
    </>
  );
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-tap w-full items-center gap-3 border-b border-line py-3 text-left last:border-b-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      >
        {inner}
      </button>
    );
  }
  return <div className="flex min-h-tap items-center gap-3 border-b border-line py-3 last:border-b-0">{inner}</div>;
}
