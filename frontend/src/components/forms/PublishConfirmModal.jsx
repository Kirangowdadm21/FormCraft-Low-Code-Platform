import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Copy,
  ExternalLink,
  Check,
  Globe,
} from "lucide-react";
import { safeCopyText } from "../../utils/clipboard";
import Button from "../common/Button";
import Badge from "../common/Badge";
import Modal from "../common/Modal";
import { useToast } from "../common/Toast";
export default function PublishConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  version,
  isPublishing,
  formTitle,
  formId,
  onNavigateToPublished,
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const confirmBtnRef = useRef(null);
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [publishTimestamp, setPublishTimestamp] = useState(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      if (version?.ispublished) {
        setPublishedSuccess(true);
        setPublishTimestamp(
          version.publishedat
            ? new Date(version.publishedat).toLocaleString()
            : new Date().toLocaleString(),
        );
      } else {
        setPublishedSuccess(false);
        setPublishTimestamp(null);
      }
      setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);
    } else {
      setPublishedSuccess(false);
      setCopied(false);
    }
  }, [isOpen, version]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isPublishing) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPublishing, onClose]);
  if (!isOpen || !version) return null;
  const effectiveFormId = formId || version.formid || version.form_id;
  const publicUrl = effectiveFormId
    ? `${window.location.origin}/#/public/forms/${effectiveFormId}`
    : "";
  const handlePublishClick = async () => {
    try {
      await onConfirm(version.version_number);
      setPublishedSuccess(true);
      setPublishTimestamp(new Date().toLocaleString());
      toast.success(
        `Version ${version.version_number} published successfully!`,
      );
    } catch (err) {
      toast.error(err.message || "Failed to publish form version");
    }
  };
  const handleCopyLink = () => {
    if (!publicUrl) return;
    safeCopyText(publicUrl).then(() => {
      setCopied(true);
      toast.success("Public URL copied to clipboard");
      setTimeout(() => setCopied(false), 3000);
    });
  };
  const handleOpenForm = () => {
    if (!publicUrl) return;
    window.location.href = publicUrl;
  };
  const handleClose = () => {
    if (isPublishing) return;
    setPublishedSuccess(false);
    setCopied(false);
    onClose();
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        publishedSuccess
          ? "✓ Form Published Successfully"
          : `Publish Version ${version.version_number}?`
      }
      subtitle={formTitle || "Form Version Management"}
      maxWidth="max-w-md"
      footer={
        publishedSuccess ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              width: "100%",
              alignItems: "center",
            }}
          >
            <Button
              variant="primary"
              leftIcon={ExternalLink}
              onClick={handleOpenForm}
            >
              {t("publishConfirmModal.openForm")}
            </Button>
            <Button
              variant="outline"
              leftIcon={copied ? Check : Copy}
              onClick={handleCopyLink}
            >
              {copied ? "Copied" : "Copy Link"}
            </Button>
            {onNavigateToPublished && (
              <Button
                variant="outline"
                leftIcon={Globe}
                onClick={() => {
                  handleClose();
                  onNavigateToPublished();
                }}
              >
                {t("publishConfirmModal.viewPublishedForms")}
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={handleClose}
              style={{
                marginLeft: "auto",
              }}
            >
              {t("publishConfirmModal.close")}
            </Button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isPublishing}
            >
              {t("publishConfirmModal.cancel")}
            </Button>
            <Button
              ref={confirmBtnRef}
              variant="primary"
              leftIcon={Send}
              isLoading={isPublishing}
              onClick={handlePublishClick}
            >
              {t("publishConfirmModal.publish")}
            </Button>
          </div>
        )
      }
    >
      {publishedSuccess ? (
        <div className="publish-success-content">
          <div
            className="publish-success-card"
            style={{
              padding: "1rem",
              background: "rgba(15, 76, 58, 0.06)",
              borderRadius: "12px",
              border: "1px solid rgba(15, 76, 58, 0.2)",
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: "rgba(15, 76, 58, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--ledger)",
                }}
              >
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "var(--ink)",
                  }}
                >
                  {formTitle || "Form"}
                </h3>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginTop: "0.25rem",
                    alignItems: "center",
                  }}
                >
                  <Badge variant="outline">
                    {t("publishConfirmModal.version")}{" "}
                    {version.version_number}
                  </Badge>
                  <Badge variant="success">
                    {t("publishConfirmModal.statusPublished")}
                  </Badge>
                </div>
              </div>
            </div>

            {publishTimestamp && (
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  borderTop: "1px dashed var(--rule)",
                  paddingTop: "0.5rem",
                  marginTop: "0.5rem",
                }}
              >
                <span>{t("publishConfirmModal.publishedOn")}</span>
                <strong
                  style={{
                    color: "var(--ink)",
                  }}
                >
                  {publishTimestamp}
                </strong>
              </div>
            )}
          </div>

          {/* Public URL Box */}
          {publicUrl && (
            <div
              className="public-url-section"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <label
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
              >
                {t("publishConfirmModal.shareablePublicLink")}
              </label>
              <div
                className="public-url-box"
                style={{
                  background: "var(--field)",
                  border: "1px solid var(--rule)",
                  borderRadius: "8px",
                  padding: "0.75rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                <a
                  href={publicUrl}
                  target="_self"
                  rel="noopener noreferrer"
                  style={{
                    color: "var(--ledger)",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    wordBreak: "break-all",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    textDecoration: "none",
                  }}
                  title={t("publishConfirmModal.clickToOpenPublic")}
                >
                  <span>{publicUrl}</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="publish-confirm-draft-content">
          <div
            className="publish-confirm-alert"
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              padding: "1rem",
              borderRadius: "10px",
              display: "flex",
              gap: "0.75rem",
              marginBottom: "1.25rem",
            }}
          >
            <AlertCircle
              size={20}
              style={{
                color: "#d97706",
                flexShrink: 0,
                marginTop: "2px",
              }}
            />
            <div
              className="publish-alert-text"
              style={{
                fontSize: "0.85rem",
              }}
            >
              <strong
                style={{
                  color: "var(--ink)",
                  display: "block",
                  marginBottom: "0.2rem",
                }}
              >
                {t("publishConfirmModal.thisVersionWillBecome")}
              </strong>
              <p
                style={{
                  color: "var(--text-secondary)",
                  margin: 0,
                }}
              >
                {t("publishConfirmModal.publishingVersion")}{" "}
                {version.version_number}{" "}
                {t("publishConfirmModal.willMarkItAs")}
              </p>
            </div>
          </div>

          <div
            className="publish-version-summary-box"
            style={{
              background: "var(--field)",
              border: "1px solid var(--rule)",
              borderRadius: "10px",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            <div
              className="summary-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span
                className="summary-label"
                style={{
                  color: "var(--text-muted)",
                }}
              >
                {t("publishConfirmModal.targetVersion")}
              </span>
              <span
                className="summary-value highlight"
                style={{
                  fontWeight: 700,
                  color: "var(--ledger)",
                }}
              >
                {t("publishConfirmModal.v")}
                {version.version_number}
              </span>
            </div>
            <div
              className="summary-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span
                className="summary-label"
                style={{
                  color: "var(--text-muted)",
                }}
              >
                {t("publishConfirmModal.totalFields")}
              </span>
              <span
                className="summary-value"
                style={{
                  fontWeight: 600,
                  color: "var(--ink)",
                }}
              >
                {version.fields ? version.fields.length : 0}{" "}
                {t("publishConfirmModal.fields")}
              </span>
            </div>
            <div
              className="summary-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                className="summary-label"
                style={{
                  color: "var(--text-muted)",
                }}
              >
                {t("publishConfirmModal.currentStatus")}
              </span>
              <Badge variant={version.ispublished ? "success" : "neutral"}>
                {version.ispublished ? "Published" : "Draft"}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
