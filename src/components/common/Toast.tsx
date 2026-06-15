interface ToastProps {
  message: string | null;
}

export const Toast = ({ message }: ToastProps) => {
  if (!message) return null;

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-in no-print">
      <div className="bg-bujo-accent/90 text-white rounded-2xl px-6 py-4 flex items-center gap-3 border border-white/10 shadow-2xl backdrop-blur-xl max-w-sm">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};
