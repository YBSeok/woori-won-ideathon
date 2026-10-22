import { AnimatePresence, motion } from 'framer-motion';

export function Toast({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="pointer-events-none absolute bottom-24 left-1/2 z-50 w-[calc(100%-40px)] -translate-x-1/2 rounded-button bg-textStrong px-4 py-3 text-center text-sm text-white"
        >
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
