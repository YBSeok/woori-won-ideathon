import { AnimatePresence, motion } from 'framer-motion';

export function Toast({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          role="status"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center px-5"
        >
          <p className="w-full rounded-button bg-textStrong px-4 py-3 text-center text-sm leading-6 text-white">{message}</p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
