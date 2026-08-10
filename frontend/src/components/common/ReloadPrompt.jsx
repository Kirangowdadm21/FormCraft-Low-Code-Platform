import React, { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useToast } from "./Toast";
import { RefreshCw, Download } from "lucide-react";

export default function ReloadPrompt() {
  const toast = useToast();
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("[PWA] Service Worker registered:", r);
    },
    onRegisterError(error) {
      console.error("[PWA] Service Worker registration error:", error);
    },
  });

  // Use toast when app is ready for offline use
  useEffect(() => {
    if (offlineReady) {
      toast.success("FormCraft is cached and ready to work offline!");
      setOfflineReady(false);
    }
  }, [offlineReady, toast, setOfflineReady]);

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!needRefresh) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        background: "var(--card-bg, #ffffff)",
        border: "1px solid var(--border-color, #EAEAEC)",
        borderRadius: "12px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        padding: "1.25rem",
        maxWidth: "360px",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
        animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "var(--accent-light, rgba(79, 70, 229, 0.08))",
            color: "var(--primary, #4F46E5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <RefreshCw size={18} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <h4
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "var(--text-primary, #101113)",
              margin: 0,
            }}
          >
            Update Available
          </h4>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--text-secondary, #6B7280)",
              lineHeight: "1.35",
              margin: 0,
            }}
          >
            A new version of FormCraft is available. Update now to access the latest features and fixes.
          </p>
        </div>
      </div>
      
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={close}
          style={{
            background: "transparent",
            border: "1px solid var(--border-color, #EAEAEC)",
            color: "var(--text-secondary, #6B7280)",
            padding: "0.5rem 0.85rem",
            borderRadius: "6px",
            fontSize: "0.78rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-secondary, #F3F4F6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          Dismiss
        </button>
        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          style={{
            background: "var(--primary, #4F46E5)",
            border: "none",
            color: "#FFFFFF",
            padding: "0.5rem 0.85rem",
            borderRadius: "6px",
            fontSize: "0.78rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "var(--transition-fast)",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--primary-hover, #4338CA)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--primary, #4F46E5)";
          }}
        >
          <Download size={14} />
          Update & Reload
        </button>
      </div>
    </div>
  );
}
