import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export function BottomSheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
        <motion.div
          className="absolute inset-0 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            aria-label="시트 닫기"
            className="absolute inset-0 bg-textStrong/40"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="absolute inset-x-0 bottom-0 z-10 max-h-[78%] overflow-y-auto rounded-t-card bg-surface px-5 pb-6 pt-3 shadow-card"
            initial={{ y: 48 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-chip bg-line" />
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-textStrong">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-textBody"
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
  );
}
