import { useTranslation } from "react-i18next";
import React from "react";
import { X, GitBranch, AlertCircle, Loader2 } from "lucide-react";
export default function SaveVersionModal({
  isOpen,
  onClose,
  onConfirm,
  currentVersionNumber,
  nextVersionNumber,
  saving,
}) {
  const { t } = useTranslation();
  if (!isOpen) return null;
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
              gap: "0.6rem",
            }}
          >
            <div className="version-detail-icon">
              <GitBranch size={18} />
            </div>
            <h2 className="modal-title">
              {t("saveVersionModal.createVersion")}
              {nextVersionNumber}
              {t("saveVersionModal.text")}
            </h2>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            disabled={saving}
          >
            <X size={20} />
          </button>
        </div>

        <div
          className="modal-body"
          style={{
            padding: "1.25rem 1.5rem",
          }}
        >
          <div
            style={{
              background: "rgba(139, 92, 246, 0.08)",
              border: "1px solid rgba(139, 92, 246, 0.25)",
              borderRadius: "10px",
              padding: "1rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
            }}
          >
            <AlertCircle
              size={20}
              color="var(--primary)"
              style={{
                marginTop: "0.1rem",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                fontSize: "0.9rem",
                color: "var(--text-primary)",
                lineHeight: "1.5",
              }}
            >
              {currentVersionNumber === 0 ? (
                <>
                  {t("saveVersionModal.thisWillSaveYour")}
                  <strong>{t("saveVersionModal.version1")}</strong>
                  {t("saveVersionModal.text")}
                  <br />
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {t("saveVersionModal.yourFormCurrentlyHas")}
                  </span>
                </>
              ) : (
                <>
                  {t("saveVersionModal.savingTheseChangesWill")}
                  <strong>
                    {t("saveVersionModal.newVersionV")}
                    {nextVersionNumber}
                    {t("saveVersionModal.text")}
                  </strong>
                  {t("saveVersionModal.text")}
                  <br />
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {t("saveVersionModal.version")}
                    {currentVersionNumber}
                    {t("saveVersionModal.willRemainCompletelyUnchanged")}
                  </span>
                </>
              )}
            </div>
          </div>

          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
            }}
          >
            {t("saveVersionModal.allCurrentFieldConfigurations")}
            {nextVersionNumber}
            {t("saveVersionModal.text")}
          </p>
        </div>

        <div
          className="modal-footer"
          style={{
            justifyContent: "flex-end",
            gap: "0.75rem",
          }}
        >
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            {t("saveVersionModal.cancel")}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onConfirm}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>
                  {t("saveVersionModal.creatingVersion")}
                  {nextVersionNumber}
                  {t("saveVersionModal.text")}
                </span>
              </>
            ) : (
              <>
                <GitBranch size={16} />
                <span>
                  {t("saveVersionModal.confirmCreateVersion")}
                  {nextVersionNumber}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
