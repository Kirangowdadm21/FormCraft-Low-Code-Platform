import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";
import { useTemplate } from "../../services/templatesApi";
export default function UseTemplateModal({
  isOpen,
  onClose,
  template,
  onFormCreated,
  onSuccess,
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (template) {
      setTitle(template.title || "");
      setDescription(template.description || "");
      setError(null);
    }
  }, [template]);
  if (!isOpen || !template) return null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Form title is required");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const newForm = await useTemplate(template.id, {
        title: title.trim(),
        description: description.trim() || null,
      });
      const callback = onFormCreated || onSuccess;
      if (typeof callback === "function") {
        callback(newForm);
      }
      onClose();
    } catch (err) {
      console.error("Use template error:", err);
      setError(err.message || "Failed to create form from template");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Sparkles size={20} color="var(--ledger)" />
            <h2 className="modal-title">
              {t("useTemplateModal.useTemplateToCreate")}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="modal-error">{error}</div>}

            <p
              style={{
                fontSize: "0.88rem",
                color: "var(--text-secondary)",
                marginBottom: "1.25rem",
              }}
            >
              {t("useTemplateModal.createANewForm")}
              <strong
                style={{
                  color: "var(--ink)",
                }}
              >
                {t("useTemplateModal.text")}
                {template.title}
                {t("useTemplateModal.text")}
              </strong>
              {t("useTemplateModal.all")}
              {template.fields?.length || 0}
              {t("useTemplateModal.fieldsWillBeCopied")}
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="new-form-title">
                {t("useTemplateModal.newFormTitle")}
                <span
                  style={{
                    color: "#ef4444",
                  }}
                >
                  {t("useTemplateModal.text")}
                </span>
              </label>
              <input
                id="new-form-title"
                type="text"
                className="form-input"
                placeholder={t("useTemplateModal.enterFormTitle")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new-form-description">
                {t("useTemplateModal.formDescription")}
              </label>
              <textarea
                id="new-form-description"
                className="form-textarea"
                rows={3}
                placeholder={t("useTemplateModal.enterDescription")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              {t("useTemplateModal.cancel")}
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{t("useTemplateModal.creatingForm")}</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>{t("useTemplateModal.createLaunchBuilder")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
