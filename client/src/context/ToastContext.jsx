import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isInfo = toast.type === 'info';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all transform translate-y-0 text-sm animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                isSuccess
                  ? 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                  : isError
                  ? 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                  : 'bg-blue-50/95 dark:bg-blue-950/90 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'
              }`}
            >
              <div className="mr-3 mt-0.5 flex-shrink-0">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
                {isInfo && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
              </div>
              <div className="flex-1 font-semibold">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
