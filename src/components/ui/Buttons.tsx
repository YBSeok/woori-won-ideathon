import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/format';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  full?: boolean;
};

const base =
  'inline-flex min-h-tap items-center justify-center gap-1 rounded-button px-4 text-[15px] font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export function PrimaryButton({ children, full = true, className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(base, 'bg-primary text-white active:bg-primaryPressed', full && 'w-full', className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, full = true, className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        base,
        'border border-line bg-surface text-textStrong active:bg-bg',
        full && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
