import { ExampleBadge } from './Badge';
import { formatWon } from '../../lib/format';

export function AmountText({
  value,
  example = false,
  size = 'md',
}: {
  value: number;
  example?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass = size === 'lg' ? 'text-[28px] leading-9' : size === 'sm' ? 'text-sm' : 'text-lg';
  return (
    <span className="inline-flex items-center gap-1.5 align-middle">
      <span className={`font-bold tracking-tight text-textStrong ${sizeClass}`}>{formatWon(value)}</span>
      {example ? <ExampleBadge /> : null}
    </span>
  );
}

export function ExampleValue({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 align-middle">
      <span className="font-semibold text-textStrong">{children}</span>
      <ExampleBadge />
    </span>
  );
}
