import { Check } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
  isVisible: boolean;
  onHide: () => void;
  message?: string;
  duration?: number;
}

export default function Toast({
  isVisible,
  onHide,
  message = "Salvo com sucesso!",
  duration = 1000,
}: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onHide]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Toast */}
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 flex items-center space-x-3 animate-toast-in pointer-events-auto">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-5 h-5 text-green-600" />
        </div>
        <p className="text-sm font-semibold text-gray-900">{message}</p>
      </div>

      <style jsx>{`
        @keyframes toast-in {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-toast-in {
          animation: toast-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
