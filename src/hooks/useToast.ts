/**
 * useToast — Custom Hook
 * Manages the application's toast notification system.
 */
import { useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastState {
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const clearToast = () => setToast(null);

  return { toast, showToast, clearToast };
}
