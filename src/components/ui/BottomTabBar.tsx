import { Gift, House, LayoutGrid, Menu } from 'lucide-react';
import { cn } from '../../lib/format';

const tabs = [
  { id: 'home', label: '홈', icon: House },
  { id: 'product', label: '상품', icon: LayoutGrid },
  { id: 'benefit', label: '혜택', icon: Gift },
  { id: 'all', label: '전체', icon: Menu },
] as const;

export type TabId = (typeof tabs)[number]['id'];

export function BottomTabBar({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
}) {
  return (
    <nav className="grid shrink-0 grid-cols-4 border-t border-line bg-surface px-2 pb-[max(6px,env(safe-area-inset-bottom))] pt-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex min-h-tap flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
              selected ? 'text-primary' : 'text-textWeak',
            )}
            aria-current={selected ? 'page' : undefined}
          >
            <Icon size={20} aria-hidden />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
