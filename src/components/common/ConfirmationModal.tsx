import React from 'react';
import { ShieldAlert, Check, X } from 'lucide-react';
import { useBujo } from '../../context/BujoContext';

export const ConfirmationModal = () => {
  const { confirmModal, setConfirmModal } = useBujo();

  if (!confirmModal) return null;

  const {
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    isDanger = false
  } = confirmModal;

  const handleConfirm = () => {
    onConfirm();
    setConfirmModal(null);
  };

  const handleCancel = () => {
    setConfirmModal(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={handleCancel}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-3xl p-6 bg-zinc-150/90 dark:bg-zinc-900/90 border border-zinc-300/40 dark:border-white/10 shadow-2xl backdrop-blur-xl animate-fade-in flex flex-col gap-4 text-bujo-text">
        <div className="flex items-start gap-4">
          {/* Warning Icon Container */}
          <div className={`p-3 rounded-2xl shrink-0 border ${
            isDanger 
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
              : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
          }`}>
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-1 min-w-0">
            <h3 className="text-lg font-bold tracking-tight leading-tight">
              {title}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
              {message}
            </p>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200/40 dark:border-white/5">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-zinc-300/80 dark:bg-white/10 text-bujo-text rounded-xl text-xs font-bold hover:bg-zinc-400 dark:hover:bg-white/20 transition-all cursor-pointer flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              isDanger 
                ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/10' 
                : 'bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/10'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
