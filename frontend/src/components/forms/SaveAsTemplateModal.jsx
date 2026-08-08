import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { X, Copy, Loader2, AlertCircle } from "lucide-react";
import { createTemplate } from "../../services/templatesApi";
export default function SaveAsTemplateModal({
  isOpen,
  onClose,
  form,
  fields,
  isDirty,
  onTemplateSaved,
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (form) {
      setTitle(form.title || "");
      setDescription(form.description || "");
      setError(null);
    }
  }, [form, isOpen]);
  if (!isOpen) return null;

  /**
   * Step 0 Field Transformation Function
   * Maps Form Field schema to TemplateFieldCreate schema
   */
  const transformFieldsToTemplateSchema = (formFields) => {
    if (!formFields || !Array.isArray(formFields)) return [];
    return formFields.map((field, idx) => {
      // 1. Sanitize options array if present
      let sanitizedOptions = null;
      if (
        field.options &&
        Array.isArray(field.options) &&
        field.options.length > 0
      ) {
        sanitizedOptions = field.options.map((opt, optIdx) => ({
          optiontext:
            opt.optiontext ||
            (typeof opt === "string" ? opt : `Option ${optIdx + 1}`),
          value:
            opt.value ||
            (typeof opt === "string"
              ? opt.toLowerCase().replace(/\s+/g, "_")
              : `option_${optIdx + 1}`),
          display_order: opt.display_order || optIdx + 1,
        }));
      }

      // 2. Return exact TemplateFieldCreate structure
      return {
        label: field.label || `Field ${idx + 1}`,
        field_name: field.field_name || `field_${idx + 1}`,
        field_type: field.field_type || "text",
        placeholder: field.placeholder?.trim() || null,
        required: !!field.required,
        display_order: field.display_order || idx + 1,
        validation_conf: field.validation_conf || null,
        options: sanitizedOptions,
      };
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Template Name is required");
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // Transform form fields to TemplateFieldCreate shape
      const templateFields = transformFieldsToTemplateSchema(fields);
      const templatePayload = {
        title: title.trim(),
        description: description.trim() || null,
        fields: templateFields,
      };
      const newTemplate = await createTemplate(templatePayload);
      onTemplateSaved(newTemplate);
      onClose();
    } catch (err) {
      console.error("Error saving form as template:", err);
      setError(err.message || "Failed to save form as template");
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
            <Copy size={20} color="var(--ledger)" />
            <h2 className="modal-title">
              {t("saveAsTemplateModal.saveFormAsTemplate")}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="modal-error">{error}</div>}

            {/* Unsaved changes notice */}
            {isDirty && (
              <div
                style={{
                  background: "rgba(234, 179, 8, 0.1)",
                  border: "1px solid rgba(234, 179, 8, 0.3)",
                  borderRadius: "8px",
                  padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  fontSize: "0.85rem",
                  color: "var(--ink)",
                }}
              >
                <AlertCircle
                  size={18}
                  color="#eab308"
                  style={{
                    flexShrink: 0,
                  }}
                />
                <span>
                  <strong>{t("saveAsTemplateModal.notice")}</strong>
                  {t("saveAsTemplateModal.thisWillSaveA")}
                </span>
              </div>
            )}

            <p
              style={{
                fontSize: "0.88rem",
                color: "var(--text-secondary)",
                marginBottom: "1.25rem",
              }}
            >
              {t("saveAsTemplateModal.createAReusableBlueprint")}{" "}
              <strong>{fields?.length || 0}</strong>
              {t("saveAsTemplateModal.questionFields")}
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="template-title">
                {t("saveAsTemplateModal.templateName")}
                <span
                  style={{
                    color: "#ef4444",
                  }}
                >
                  {t("saveAsTemplateModal.text")}
                </span>
              </label>
              <input
                id="template-title"
                type="text"
                className="form-input"
                placeholder={t("saveAsTemplateModal.eGJobApplicationBlueprint")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="template-description">
                {t("saveAsTemplateModal.templateDescription")}
              </label>
              <textarea
                id="template-description"
                className="form-textarea"
                rows={3}
                placeholder={t("saveAsTemplateModal.describeThePurposeOf")}
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
              {t("saveAsTemplateModal.cancel")}
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{t("saveAsTemplateModal.savingTemplate")}</span>
                </>
              ) : (
                <>
                  <Copy size={18} />
                  <span>{t("saveAsTemplateModal.saveTemplate")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
