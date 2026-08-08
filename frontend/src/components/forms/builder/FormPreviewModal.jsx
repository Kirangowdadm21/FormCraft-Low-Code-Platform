import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import { X, Eye } from "lucide-react";
import PublicFormRenderer from "../../public/PublicFormRenderer";
export default function FormPreviewModal({ isOpen, onClose, form, fields }) {
  const { t } = useTranslation();
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      <div
        className="modal-content modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Eye size={20} color="var(--primary)" />
            <h2 id="preview-modal-title" className="modal-title">
              {t("formPreviewModal.formLivePreview")}
            </h2>
          </div>
          <span className="badge badge-success">
            {t("formPreviewModal.respondentView")}
          </span>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label={t("formPreviewModal.closePreviewDialog")}
          >
            <X size={20} />
          </button>
        </div>

        <div
          className="modal-body"
          style={{
            background: "#f0ebf8",
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {/* Form Title Card */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderTop: "8px solid var(--accent)",
              borderRadius: "16px",
              padding: "28px 32px",
              maxWidth: "760px",
              margin: "0 auto",
              width: "100%",
              boxShadow: "0 4px 12px -2px rgba(0,0,0,0.04)",
            }}
          >
            <h1 style={{ fontSize: "1.65rem", fontWeight: "700", color: "#0F172A", marginBottom: "8px" }}>
              {form?.title || "Untitled Form"}
            </h1>
            <p style={{ color: "#64748B", fontSize: "0.9375rem" }}>
              {form?.description || ""}
            </p>
          </div>

          {/* Field Cards rendered by PublicFormRenderer */}
          <div style={{ maxWidth: "760px", margin: "0 auto", width: "100%" }}>
            {/* Reuse PublicFormRenderer in preview mode */}
            <PublicFormRenderer
              fields={fields || []}
              isPreview={true}
              isSubmitting={false}
            />
          </div>
        </div>

        <div className="modal-footer" style={{ background: "#FFFFFF", borderTop: "1px solid #E2E8F0", padding: "16px 24px" }}>
          <button type="button" className="btn-secondary" onClick={onClose} style={{ borderRadius: "8px", fontWeight: "500" }}>
            {t("formPreviewModal.closePreview")}
          </button>
        </div>
      </div>
    </div>
  );
}
