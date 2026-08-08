import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Eye,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Loader2,
  QrCode,
} from "lucide-react";
import { getFormById, getFormVersions } from "../../services/formsApi";
import VersionTimeline from "./VersionTimeline";
import PublicFormQRModal from "./PublicFormQRModal";
export default function FormDetailModal({
  isOpen,
  onClose,
  formId,
  onEditVersion,
  onNavigateToPublished,
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showQr, setShowQr] = useState(false);
  const fetchFormData = useCallback(async () => {
    if (!formId) return;
    setLoading(true);
    setError(null);
    try {
      const [form, vers] = await Promise.all([
        getFormById(formId),
        getFormVersions(formId).catch(() => []),
      ]);
      const versionList = Array.isArray(vers) && vers.length > 0 ? vers : (form?.versions || []);
      setFormData({
        ...form,
        versions: versionList,
      });
    } catch (err) {
      setError(err.message || "Failed to fetch form details");
    } finally {
      setLoading(false);
    }
  }, [formId]);
  useEffect(() => {
    if (formId && isOpen) {
      fetchFormData();
    }
  }, [formId, isOpen, fetchFormData]);
  const handleVersionPublished = () => {
    // Automatically refresh Form Overview after publishing
    fetchFormData();
  };
  if (!isOpen) return null;
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return dateStr;
    }
  };
  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-detail-title"
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
            <h2 id="form-detail-title" className="modal-title">
              {t("formDetailModal.formOverview")}
            </h2>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label={t("formDetailModal.closeFormOverviewDialog")}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {loading && !formData && (
            <div
              style={{
                padding: "3rem 0",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              <Loader2
                size={32}
                className="animate-spin"
                style={{
                  margin: "0 auto 0.75rem auto",
                  color: "var(--primary)",
                }}
              />
              <p>{t("formDetailModal.loadingFormDetails")}</p>
            </div>
          )}

          {error && !formData && <div className="modal-error">{error}</div>}

          {formData && (
            <div>
              <div
                style={{
                  marginBottom: "1.5rem",
                  borderBottom: "1px solid var(--border-color)",
                  paddingBottom: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.5rem",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {formData.title}
                  </h3>
                  <span
                    className={`badge ${formData.status === "published" ? "badge-success" : formData.status === "archived" ? "badge-archived" : "badge-draft"}`}
                  >
                    {formData.status?.toUpperCase() || "DRAFT"}
                  </span>
                </div>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.95rem",
                    lineHeight: "1.5",
                  }}
                >
                  {formData.description ||
                    "No description provided for this form."}
                </p>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">
                    <User size={14} />
                    {t("formDetailModal.ownerId")}
                  </span>
                  <span className="detail-value">{formData.owner_id}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">
                    <ShieldCheck size={14} />
                    {t("formDetailModal.currentActiveVersion")}
                  </span>
                  <span className="detail-value highlight-active">
                    {formData.current_version
                      ? `Version ${formData.current_version}`
                      : "No Active Version"}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">
                    <Calendar size={14} />
                    {t("formDetailModal.createdAt")}
                  </span>
                  <span className="detail-value">
                    {formatDate(formData.createdat)}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">
                    <Clock size={14} />
                    {t("formDetailModal.lastUpdated")}
                  </span>
                  <span className="detail-value">
                    {formatDate(formData.updatedat)}
                  </span>
                </div>
              </div>

              {/* Version Management & Timeline Component */}
              <VersionTimeline
                versions={formData.versions || []}
                currentVersion={formData.current_version}
                formId={formData.id}
                formTitle={formData.title}
                formStatus={formData.status}
                onVersionPublished={handleVersionPublished}
                isLoading={loading}
                error={error}
                onRetry={fetchFormData}
                onNavigateToPublished={onNavigateToPublished}
                onEditVersion={(ver) => {
                  onClose();
                  if (onEditVersion) {
                    onEditVersion(formData, ver);
                  }
                }}
              />
            </div>
          )}
        </div>

        <div
          className="modal-footer"
          style={{
            justifyContent: "space-between",
          }}
        >
          {formData && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowQr(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <QrCode size={16} />
              <span>{t("formDetailModal.qrCode")}</span>
            </button>
          )}
          <button type="button" className="btn-secondary" onClick={onClose}>
            {t("formDetailModal.close")}
          </button>
        </div>

        <PublicFormQRModal
          isOpen={showQr}
          onClose={() => setShowQr(false)}
          form={formData}
        />
      </div>
    </div>
  );
}
