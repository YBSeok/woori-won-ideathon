import type { ReactNode } from 'react';
import { Signal, BatteryFull } from 'lucide-react';

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-stage frame:flex frame:min-h-dvh frame:items-center frame:justify-center frame:p-6">
      <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col frame:h-[min(844px,calc(100dvh-48px))] frame:w-[390px] frame:max-w-none frame:rounded-[36px] frame:bg-textStrong frame:p-2.5 frame:shadow-card">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-bg frame:rounded-[28px]">
          <div className="hidden h-7 shrink-0 items-center justify-between bg-surface px-5 text-[11px] font-semibold text-textStrong frame:flex">
            <span>09:41</span>
            <span className="flex items-center gap-1 text-textBody">
              <Signal size={12} aria-hidden />
              <BatteryFull size={14} aria-hidden />
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
