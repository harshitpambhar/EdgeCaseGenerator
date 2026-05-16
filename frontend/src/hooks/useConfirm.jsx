import { createContext, useContext, useState, useCallback } from 'react';

export const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [confirm, setConfirm] = useState(null);

  const show = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirm({
        title: options.title || 'Confirm',
        message: options.message || 'Are you sure?',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        onConfirm: () => {
          setConfirm(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirm(null);
          resolve(false);
        },
      });
    });
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm, show }}>
      {children}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context.show;
};
