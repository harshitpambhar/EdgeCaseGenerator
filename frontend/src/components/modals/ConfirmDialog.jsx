import { motion, AnimatePresence } from 'framer-motion';
import { useContext } from 'react';
import { ConfirmContext } from '../../hooks/useConfirm.jsx';

const ConfirmDialog = () => {
  const context = useContext(ConfirmContext);
  const data = context?.confirm;

  if (!data) return null;

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-slate-900 border border-white/10 rounded-xl p-6 max-w-sm shadow-2xl"
          >
            <h2 className="text-lg font-semibold text-white mb-2">{data.title}</h2>
            <p className="text-sm text-white/60 mb-6">{data.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={data.onCancel}
                className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/5 text-white/60 hover:text-white text-sm font-medium transition-colors"
              >
                {data.cancelText}
              </button>
              <button
                onClick={data.onConfirm}
                className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition-colors"
              >
                {data.confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
