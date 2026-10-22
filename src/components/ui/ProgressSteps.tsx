import { Check } from 'lucide-react';
import { cn } from '../../lib/format';

const STEPS = ['만기 감지', '자금 용도', '선택지 비교', '승인 후 실행', '사후 점검'] as const;

export function ProgressSteps({ current }: { current: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <ol className="grid grid-cols-5 gap-1" aria-label="WON하는 만기 진행 단계">
      {STEPS.map((label, index) => {
        const step = (index + 1) as 1 | 2 | 3 | 4 | 5;
        const done = step < current;
        const active = step === current;
        return (
          <li key={label} className="min-w-0 text-center" aria-current={active ? 'step' : undefined}>
            <div className="mx-auto mb-1 flex items-center">
              <span className={cn('h-0.5 flex-1', index === 0 ? 'bg-transparent' : done || active ? 'bg-primary' : 'bg-line')} />
              <span
                className={cn(
                  'mx-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                  done || active ? 'bg-primary text-white' : 'bg-line text-textWeak',
                )}
              >
                {done ? <Check size={12} aria-hidden /> : step}
              </span>
              <span
                className={cn(
                  'h-0.5 flex-1',
                  index === STEPS.length - 1 ? 'bg-transparent' : done ? 'bg-primary' : 'bg-line',
                )}
              />
            </div>
            <span className={cn('block text-[10px] leading-3', active ? 'font-bold text-primary' : 'text-textWeak')}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
