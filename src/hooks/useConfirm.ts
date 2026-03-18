/**
 * useConfirm — Custom Hook
 * Manages state for the confirmation modal dialog.
 */
import { useState } from 'react';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => Promise<void> | void;
}

export interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function useConfirm(onError?: (msg: string) => void) {
  const [confirmModal, setConfirmModal] = useState<ConfirmState | null>(null);

  const confirmAction = (options: ConfirmOptions) => {
    setConfirmModal({
      isOpen: true,
      ...options,
      onConfirm: async () => {
        setConfirmModal(prev => prev ? { ...prev, isLoading: true } : null);
        try {
          await options.onConfirm();
        } catch (error: any) {
          console.error('Confirm action failed:', error);
          const msg = error.details
            ? `${error.message}: ${error.details}${error.how_to_fix || ''}`
            : (error.message || 'Erro ao realizar operação');
          if (onError) onError(msg);
        } finally {
          setConfirmModal(null);
        }
      }
    });
  };

  const dismissConfirm = () => setConfirmModal(null);

  return { confirmModal, confirmAction, dismissConfirm };
}
