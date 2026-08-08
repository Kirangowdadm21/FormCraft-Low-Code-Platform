import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    {
      success: (msg) => addToast(msg, "success"),
      error: (msg) => addToast(msg, "error"),
      info: (msg) => addToast(msg, "info"),
    },
    [addToast],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fc-toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`fc-toast fc-toast-${t.type}`}>
            {t.type === "success" && (
              <CheckCircle2 size={18} className="fc-toast-icon" />
            )}
            {t.type === "error" && (
              <AlertCircle size={18} className="fc-toast-icon" />
            )}
            {t.type === "info" && <Info size={18} className="fc-toast-icon" />}
            <span className="fc-toast-message">{t.message}</span>
            <button
              type="button"
              className="fc-toast-close"
              onClick={() => removeToast(t.id)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      success: (msg) => console.log("[Toast Success]", msg),
      error: (msg) => console.error("[Toast Error]", msg),
      info: (msg) => console.log("[Toast Info]", msg),
    };
  }
  return ctx;
}
