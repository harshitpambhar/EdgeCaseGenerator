import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../hooks/useNotification.jsx';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineExclamationCircle, HiOutlineInformationCircle, HiOutlineX } from 'react-icons/hi';

const NotificationItem = ({ notification, onClose }) => {
  const icons = {
    success: <HiOutlineCheckCircle className="text-emerald-400 text-xl" />,
    error: <HiOutlineXCircle className="text-rose-400 text-xl" />,
    warning: <HiOutlineExclamationCircle className="text-amber-400 text-xl" />,
    info: <HiOutlineInformationCircle className="text-indigo-400 text-xl" />,
  };

  const bgColors = {
    success: 'bg-emerald-500/10 border-emerald-500/20',
    error: 'bg-rose-500/10 border-rose-500/20',
    warning: 'bg-amber-500/10 border-amber-500/20',
    info: 'bg-indigo-500/10 border-indigo-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, y: -10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 20, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${bgColors[notification.type]} backdrop-blur-sm`}
    >
      {icons[notification.type]}
      <span className="text-sm text-white flex-1">{notification.message}</span>
      <button
        onClick={() => onClose(notification.id)}
        className="text-white/40 hover:text-white/70 transition-colors"
      >
        <HiOutlineX className="text-lg" />
      </button>
    </motion.div>
  );
};

export const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-auto max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationContainer;
