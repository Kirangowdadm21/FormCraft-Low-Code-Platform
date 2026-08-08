import { useTranslation } from "react-i18next";
import React from "react";
import { Eye, Edit3, Plus, Trash2, Layers, Sparkles } from "lucide-react";
import DynamicText from "../common/DynamicText";
import Button from "../common/Button";

export default function TemplateCard({
  template,
  onPreview,
  onUse,
  onEdit,
  onDelete,
}) {
  const { t } = useTranslation();
  const formatDate = (dateStr) => {
    if (!dateStr) return t("common.na", "N/A");
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };
  const fieldCount = template.fields ? template.fields.length : 0;
  const createdDateStr = formatDate(template.createdat);
  const updatedDateStr = formatDate(template.updatedat || template.createdat);
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "1.5rem 1.75rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.2s ease",
      }}
    >
      <div>
        {/* Top Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            marginBottom: "0.75rem",
          }}
        >
          <span
            style={{
              background: "#f1f5f9",
              color: "#475569",
              padding: "0.15rem 0.55rem",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: 700,
              fontFamily: "monospace",
            }}
          >
            {t("templates.tpl", t("templateCard.tpl", "TPL-"))}
            {template.id}
          </span>
          <span
            style={{
              background: "#f1f5f9",
              color: "#475569",
              padding: "0.15rem 0.55rem",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            {fieldCount} {fieldCount === 1 ? t("templates.field_singular", "field") : t("templates.fields_plural", t("templateCard.fields", "fields"))}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: "1.1rem",
            fontWeight: 800,
            color: "#0f172a",
            margin: "0 0 0.35rem 0",
            letterSpacing: "-0.01em",
          }}
        >
          <DynamicText text={template.title} />
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: "0.86rem",
            color: "#64748b",
            margin: "0 0 0.85rem 0",
            lineHeight: 1.5,
          }}
        >
          <DynamicText text={template.description || t("templates.no_description", t("templateCard.noDescription", "No description provided for this template."))} />
        </p>

        {/* Date Meta Subtext */}
        <div
          style={{
            fontSize: "0.78rem",
            color: "#94a3b8",
            marginBottom: "1.25rem",
          }}
        >
          {t("templates.created_prefix", t("templateCard.created", "Created "))}
          {createdDateStr} • {t("templates.updated_prefix", t("templateCard.updated", "Updated "))}
          {updatedDateStr}
        </div>
      </div>

      {/* Action Buttons Row at Bottom of Card */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
          paddingTop: "1rem",
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <Button
          variant="primary"
          size="sm"
          leftIcon={Plus}
          onClick={() => onUse(template)}
          title={t("templates.use_title", t("templateCard.useTemplateToCreate", "Use Template"))}
          style={{
            padding: "0.45rem 0.95rem",
            fontWeight: 700,
          }}
        >
          {t("templates.use", t("templateCard.use", "Use"))}
        </Button>

        <Button
          variant="outline"
          size="sm"
          leftIcon={Eye}
          onClick={() => onPreview(template)}
          title={t("templates.preview_title", t("templateCard.previewTemplateSchema", "Preview Template"))}
          style={{
            padding: "0.45rem 0.85rem",
          }}
        >
          {t("templates.preview", t("templateCard.preview", "Preview"))}
        </Button>

        <Button
          variant="outline"
          size="sm"
          leftIcon={Edit3}
          onClick={() => onEdit(template)}
          title={t("templates.edit_title", t("templateCard.editTemplate", "Edit Template"))}
          style={{
            padding: "0.45rem 0.85rem",
          }}
        >
          {t("templates.edit", t("templateCard.edit", "Edit"))}
        </Button>

        <Button
          variant="outline"
          size="sm"
          leftIcon={Trash2}
          onClick={() => onDelete(template)}
          title={t("templates.delete_title", t("templateCard.deleteTemplate", "Delete Template"))}
          style={{
            color: "#dc2626",
            borderColor: "#fee2e2",
            background: "#fff5f5",
            padding: "0.45rem 0.65rem",
          }}
        />
      </div>
    </div>
  );
}
