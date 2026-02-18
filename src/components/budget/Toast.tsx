"use client";

/**
 * Custom Toast Notification System (Phase 4)
 * Task 4.1.4: Replace alerts with toast notifications
 * Task 4.1.2: Success checkmark animations integrated
 *
 * Lightweight custom toast system with animated success feedback
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { SuccessCheckmark } from "./SuccessCheckmark";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (type: ToastType, message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  confirm: (message: string) => Promise<boolean>;
  successWithAnimation: (message?: string) => void; // Phase 4.1.2: Full-screen success animation
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    resolve: (value: boolean) => void;
  } | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successAnimationMessage, setSuccessAnimationMessage] = useState<string>("");

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (type: ToastType, message: string, duration: number = 4000) => {
      const id = `toast_${Date.now()}_${Math.random()}`;
      const newToast: Toast = { id, type, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => {
      toast("success", message, duration);
    },
    [toast]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      toast("error", message, duration);
    },
    [toast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      toast("warning", message, duration);
    },
    [toast]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      toast("info", message, duration);
    },
    [toast]
  );

  const confirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmDialog({ message, resolve });
    });
  }, []);

  // Phase 4.1.2: Success animation for important actions
  const successWithAnimation = useCallback((message?: string) => {
    setSuccessAnimationMessage(message || "Success!");
    setShowSuccessAnimation(true);
  }, []);

  const handleConfirm = useCallback(
    (result: boolean) => {
      if (confirmDialog) {
        confirmDialog.resolve(result);
        setConfirmDialog(null);
      }
    },
    [confirmDialog]
  );

  return (
    <ToastContext.Provider
      value={{ toast, success, error, warning, info, confirm, successWithAnimation }}
    >
      {children}

      {/* Phase 4.1.2: Success Checkmark Animation */}
      <SuccessCheckmark
        show={showSuccessAnimation}
        message={successAnimationMessage}
        onComplete={() => setShowSuccessAnimation(false)}
      />

      {/* Toast Container - ARIA Live Region for Screen Readers */}
      <div
        className="pointer-events-none fixed end-4 top-4 z-50 space-y-2"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
        ))}
      </div>

      {/* Confirm Dialog - Accessible Modal */}
      {confirmDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 id="confirm-dialog-title" className="mb-4 text-lg font-semibold text-gray-900">
              Confirm Action
            </h3>
            <p className="mb-6 text-gray-700">{confirmDialog.message}</p>
            <div className="flex gap-4">
              <button
                onClick={() => handleConfirm(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirm(true)}
                className="flex-1 rounded-lg bg-teal-500 px-4 py-2 text-white transition-colors hover:bg-teal-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: "bg-green-50 border-green-500 text-green-900",
    error: "bg-red-50 border-red-500 text-red-900",
    warning: "bg-amber-50 border-amber-500 text-amber-900",
    info: "bg-teal-50 border-teal-500 text-teal-900",
  };

  const iconColors = {
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-amber-600",
    info: "text-teal-600",
  };

  const Icon = icons[toast.type];

  // Use assertive for errors (urgent), polite for others
  const isUrgent = toast.type === "error";

  return (
    <div
      role={isUrgent ? "alert" : "status"}
      aria-live={isUrgent ? "assertive" : "polite"}
      aria-atomic="true"
      className={`${colors[toast.type]} pointer-events-auto w-full max-w-sm rounded-lg border-s-4 p-4 shadow-lg duration-300 animate-in slide-in-from-right`}
    >
      <div className="flex items-start gap-4">
        <Icon className={`h-5 w-5 flex-shrink-0 ${iconColors[toast.type]}`} />
        <p className="flex-1 text-sm font-medium">{toast.message}</p>
        <button
          onClick={onRemove}
          className="flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
