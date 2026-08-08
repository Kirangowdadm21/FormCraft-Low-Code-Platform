import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Globe,
  Calendar,
  Clock,
  User,
  Layers,
  ShieldCheck,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  Hash,
} from "lucide-react";
import { getFormById, getFormVersions } from "../../services/formsApi";
import { safeCopyText } from "../../utils/clipboard";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Badge from "../common/Badge";
import { useToast } from "../common/Toast";
export default function PublishedFormDetailModal({ isOpen, onClose, formId }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [formData, setFormData] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const fetchData = useCallback(async () => {
    if (!formId) return;
    setLoading(true);
    setError(null);
    try {
      const [form, vers] = await Promise.all([
        getFormById(formId),
        getFormVersions(formId).catch(() => []),
      ]);
      setFormData(form);
      setVersions(Array.isArray(vers) ? vers : []);
    } catch (err) {
      setError(err.message || "Failed to load form details");
    } finally {
      setLoading(false);
    }
  }, [formId]);
  useEffect(() => {
    if (isOpen && formId) {
      fetchData();
      setCopied(false);
    }
  }, [isOpen, formId, fetchData]);
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
  const publicUrl = formId
    ? `${window.location.origin}/#/public/forms/${formId}`
    : "";
  const handleOpenForm = () => {
    if (publicUrl) {
      window.location.href = publicUrl;
    }
  };
  const handleCopyLink = () => {
    if (!publicUrl) return;
    safeCopyText(publicUrl).then(() => {
      setCopied(true);
      toast.success("Public URL copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    });
  };
  const publishedVersion = versions.find((v) => v.ispublished);
  const fieldCount =
    formData?.fields_count ?? publishedVersion?.fields?.length ?? null;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("publishedFormDetailModal.publishedFormDetails")}
      subtitle="Complete information about this published form"
      maxWidth="max-w-xl"
      footer={
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          {formData && (
            <>
              <Button
                variant="primary"
                leftIcon={ExternalLink}
                onClick={handleOpenForm}
              >
                {t("publishedFormDetailModal.openForm")}
              </Button>
              <Button
                variant="outline"
                leftIcon={copied ? Check : Copy}
                onClick={handleCopyLink}
              >
                {copied ? "Copied" : "Copy Public URL"}
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={onClose}>
            {t("publishedFormDetailModal.close")}
          </Button>
        </div>
      }
    >
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
              color: "var(--ledger)",
            }}
          />

          <p>{t("publishedFormDetailModal.loadingFormDetails")}</p>
        </div>
      )}

      {error && !formData && <div className="modal-error">{error}</div>}

      {formData && (
        <div>
          {/* Title & Description */}
          <div
            style={{
              marginBottom: "1.25rem",
              borderBottom: "1px solid var(--rule)",
              paddingBottom: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justify: "space-between",
                alignItems: "flex-start",
                marginBottom: "0.5rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 800,
                  color: "var(--ink)",
                  margin: 0,
                }}
              >
                {formData.title}
              </h3>
              <Badge variant="success">
                {t("publishedFormDetailModal.published")}
              </Badge>
            </div>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {formData.description || "No description provided for this form."}
            </p>
          </div>

          {/* Detail Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "0.75rem",
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                background: "var(--field)",
                border: "1px solid var(--rule)",
                borderRadius: "10px",
                padding: "0.75rem 1rem",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: "0.25rem",
                }}
              >
                <ShieldCheck size={14} />
                {t("publishedFormDetailModal.currentPublishedVersion")}
              </span>
              <span
                style={{
                  fontWeight: 700,
                  color: "var(--ledger)",
                  fontSize: "0.95rem",
                }}
              >
                {formData.current_version
                  ? `Version ${formData.current_version}`
                  : "N/A"}
              </span>
            </div>

            <div
              style={{
                background: "var(--field)",
                border: "1px solid var(--rule)",
                borderRadius: "10px",
                padding: "0.75rem 1rem",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: "0.25rem",
                }}
              >
                <Calendar size={14} />
                {t("publishedFormDetailModal.publishedDate")}
              </span>
              <span
                style={{
                  fontWeight: 600,
                  color: "var(--ink)",
                  fontSize: "0.9rem",
                }}
              >
                {publishedVersion?.publishedat
                  ? formatDate(publishedVersion.publishedat)
                  : formatDate(formData.updatedat)}
              </span>
            </div>

            <div
              style={{
                background: "var(--field)",
                border: "1px solid var(--rule)",
                borderRadius: "10px",
                padding: "0.75rem 1rem",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: "0.25rem",
                }}
              >
                <User size={14} />
                {t("publishedFormDetailModal.ownerId")}
              </span>
              <span
                style={{
                  fontWeight: 600,
                  color: "var(--ink)",
                  fontSize: "0.9rem",
                }}
              >
                {formData.owner_id}
              </span>
            </div>

            <div
              style={{
                background: "var(--field)",
                border: "1px solid var(--rule)",
                borderRadius: "10px",
                padding: "0.75rem 1rem",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: "0.25rem",
                }}
              >
                <Calendar size={14} />
                {t("publishedFormDetailModal.createdDate")}
              </span>
              <span
                style={{
                  fontWeight: 600,
                  color: "var(--ink)",
                  fontSize: "0.9rem",
                }}
              >
                {formatDate(formData.createdat)}
              </span>
            </div>

            <div
              style={{
                background: "var(--field)",
                border: "1px solid var(--rule)",
                borderRadius: "10px",
                padding: "0.75rem 1rem",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: "0.25rem",
                }}
              >
                <Clock size={14} />
                {t("publishedFormDetailModal.updatedDate")}
              </span>
              <span
                style={{
                  fontWeight: 600,
                  color: "var(--ink)",
                  fontSize: "0.9rem",
                }}
              >
                {formatDate(formData.updatedat)}
              </span>
            </div>

            {fieldCount !== null && (
              <div
                style={{
                  background: "var(--field)",
                  border: "1px solid var(--rule)",
                  borderRadius: "10px",
                  padding: "0.75rem 1rem",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginBottom: "0.25rem",
                  }}
                >
                  <Layers size={14} />
                  {t("publishedFormDetailModal.numberOfFields")}
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--ink)",
                    fontSize: "0.9rem",
                  }}
                >
                  {fieldCount}
                </span>
              </div>
            )}

            <div
              style={{
                background: "var(--field)",
                border: "1px solid var(--rule)",
                borderRadius: "10px",
                padding: "0.75rem 1rem",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: "0.25rem",
                }}
              >
                <Hash size={14} />
                {t("publishedFormDetailModal.numberOfVersions")}
              </span>
              <span
                style={{
                  fontWeight: 600,
                  color: "var(--ink)",
                  fontSize: "0.9rem",
                }}
              >
                {versions.length}
              </span>
            </div>
          </div>

          {/* Light High-Contrast Public URL Box */}
          {publicUrl && (
            <div
              style={{
                padding: "1rem",
                background: "rgba(15, 76, 58, 0.05)",
                border: "1px solid rgba(15, 76, 58, 0.2)",
                borderRadius: "12px",
              }}
            >
              <label
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                {t("publishedFormDetailModal.publicFormUrl")}
              </label>
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid var(--rule)",
                  borderRadius: "8px",
                  padding: "0.65rem 0.9rem",
                  display: "flex",
                  alignItems: "center",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                }}
              >
                <a
                  href={publicUrl}
                  target="_self"
                  rel="noopener noreferrer"
                  style={{
                    color: "var(--ledger)",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    fontFamily: "var(--font-mono)",
                    wordBreak: "break-all",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span>{publicUrl}</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
