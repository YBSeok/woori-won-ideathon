import type { ReactNode } from 'react';
import { cn } from '../../lib/format';

export function Card({
  children,
  className,
  selected = false,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  const classes = cn(
    'rounded-card bg-surface p-4 shadow-card',
    selected && 'ring-2 ring-primary',
    onClick && 'text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    className,
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(classes, 'w-full')}>
        {children}
      </button>
    );
  }
  return <section className={classes}>{children}</section>;
}
