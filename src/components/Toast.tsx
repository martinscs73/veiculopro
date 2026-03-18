/**
 * Toast — Componente de Notificação
 * Extraído do App.tsx para ser reutilizável.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from './utils';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const styles = {
    success: 'bg-emerald-600 text-white shadow-emerald-200/50',
    error: 'bg-rose-600 text-white shadow-rose-200/50',
    warning: 'bg-amber-500 text-white shadow-amber-200/50',
    info: 'bg-blue-600 text-white shadow-blue-200/50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={cn(
        'fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px] max-w-[90vw] border border-white/10 backdrop-blur-md',
        styles[type] || styles.info
      )}
    >
      <div className="shrink-0">{icons[type] || icons.info}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold leading-tight">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 hover:bg-white/20 rounded-xl transition-all active:scale-90"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
