'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message: string) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message: string) => addToast(message, 'error'), [addToast]);
  const warning = useCallback((message: string) => addToast(message, 'warning'), [addToast]);
  const info = useCallback((message: string) => addToast(message, 'info'), [addToast]);

  // Intercept the default browser alert in the client-side environment
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.alert = (message: string) => {
        // Detect likely status message type
        const lower = String(message).toLowerCase();
        let detectedType: ToastType = 'info';
        if (lower.includes('success') || lower.includes('unlocked') || lower.includes('posted')) {
          detectedType = 'success';
        } else if (lower.includes('failed') || lower.includes('error') || lower.includes('invalid') || lower.includes('match!')) {
          detectedType = 'error';
        } else if (lower.includes('warning') || lower.includes('sure') || lower.includes('are you')) {
          detectedType = 'warning';
        }
        addToast(message, detectedType);
      };
    }
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, warning, info }}>
      {children}
      
      {/* Toast portal container */}
      <div 
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none"
        id="thanos-toast-portal"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastCard key={t.id} toast={t} onClose={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/90',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      text: 'text-emerald-800 dark:text-emerald-250',
      iconText: 'text-emerald-500',
      icon: CheckCircle2,
    },
    error: {
      bg: 'bg-rose-50 dark:bg-rose-950/90',
      border: 'border-rose-200 dark:border-rose-800/60',
      text: 'text-rose-800 dark:text-rose-250',
      iconText: 'text-rose-500',
      icon: XCircle,
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/90',
      border: 'border-amber-200 dark:border-amber-800/60',
      text: 'text-amber-800 dark:text-amber-250',
      iconText: 'text-amber-500',
      icon: AlertCircle,
    },
    info: {
      bg: 'bg-[#7145FF]/5 dark:bg-slate-900/95',
      border: 'border-[#7145FF]/20 dark:border-[#7145FF]/20',
      text: 'text-slate-800 dark:text-slate-200',
      iconText: 'text-[#7145FF]',
      icon: Info,
    },
  }[toast.type] || {
    bg: 'bg-white dark:bg-slate-900',
    border: 'border-slate-200 dark:border-slate-800',
    text: 'text-slate-800 dark:text-slate-250',
    iconText: 'text-slate-500',
    icon: Info,
  };

  const IconComponent = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -5, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`pointer-events-auto w-full flex items-start gap-3 p-4 rounded-xl border ${config.bg} ${config.border} shadow-lg shadow-black/5 backdrop-blur-md`}
    >
      <IconComponent className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconText}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold font-sans break-words leading-relaxed ${config.text}`}>
          {toast.message}
        </p>
      </div>
      <button 
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5 rounded-md flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
