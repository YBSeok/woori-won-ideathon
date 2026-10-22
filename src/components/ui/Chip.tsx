import { cn } from '../../lib/format';

export function Chip({
  label,
  selected = false,
  onClick,
}: {
  label: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'min-h-tap rounded-chip border px-3.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        selected ? 'border-primary bg-primary/10 text-primary' : 'border-line bg-surface text-textStrong',
      )}
    >
      {label}
    </button>
  );
}
