import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { Archive, X, Loader2, AlertTriangle } from "lucide-react";
import { archiveForm } from "../../services/formsApi";
export default function ArchiveFormDialog({
  isOpen,
  onClose,
  form,
  onFormArchived,
  onSuccess,
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  if (!isOpen || !form) return null;
  const handleArchive = async () => {
    const targetId = form.id || form.form_id;
    try {
      setLoading(true);
      setError(null);
      await archiveForm(targetId);
      const callback = onFormArchived || onSuccess;
      if (typeof callback === "function") {
        callback(targetId);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to archive form");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "480px",
        }}
      >
        <div className="modal-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <AlertTriangle size={22} color="#f59e0b" />
            <h2
              className="modal-title"
              style={{
                color: "#f59e0b",
              }}
            >
              {t("archiveFormDialog.archiveForm")}
            </h2>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <div
          className="modal-body"
          style={{
            padding: "1.5rem",
          }}
        >
          {error && <div className="modal-error">{error}</div>}

          <p
            style={{
              color: "var(--text-primary)",
              fontSize: "0.95rem",
              marginBottom: "1rem",
              lineHeight: "1.5",
            }}
          >
            {t("archiveFormDialog.areYouSureYou")}
            <strong
              style={{
                color: "var(--ink)",
              }}
            >
              {t("archiveFormDialog.text")}
              {form.title}
              {t("archiveFormDialog.text")}
            </strong>
            {t("archiveFormDialog.text")}
          </p>

          <div
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              borderRadius: "10px",
              padding: "1rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
            }}
          >
            <AlertTriangle
              size={18}
              color="#f59e0b"
              style={{
                marginTop: "0.1rem",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                lineHeight: "1.5",
              }}
            >
              {t("archiveFormDialog.archivingWill")}
              <strong>{t("archiveFormDialog.unpublish")}</strong>
              {t("archiveFormDialog.thisFormAnd")}
              <strong>
                {t("archiveFormDialog.stopAcceptingNewSubmissions")}
              </strong>
              {t("archiveFormDialog.existingSubmissionsAnd")}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {t("archiveFormDialog.cancel")}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleArchive}
            disabled={loading}
            style={{
              background: "#f59e0b",
              borderColor: "#f59e0b",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{t("archiveFormDialog.archiving")}</span>
              </>
            ) : (
              <>
                <Archive size={18} />
                <span>{t("archiveFormDialog.confirmArchive")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
