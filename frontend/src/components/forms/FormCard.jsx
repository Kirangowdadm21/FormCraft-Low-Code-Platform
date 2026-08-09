import { useTranslation } from "react-i18next";
import React from "react";
import {
  Eye,
  Edit3,
  Wrench,
  Trash2,
  Archive,
  Users,
  ShoppingBag,
  GraduationCap,
  Headphones,
  FileText,
} from "lucide-react";
import DynamicText from "../common/DynamicText";
import Badge from "../common/Badge";
import Button from "../common/Button";
const PASTEL_ICONS = [
  {
    bg: "#e0f2fe",
    color: "#0284c7",
    Icon: Users,
  },
  {
    bg: "#fef3c7",
    color: "#d97706",
    Icon: ShoppingBag,
  },
  {
    bg: "#f3e8ff",
    color: "#7e22ce",
    Icon: GraduationCap,
  },
  {
    bg: "#ffe4e6",
    color: "#e11d48",
    Icon: Headphones,
  },
  {
    bg: "#d1fae5",
    color: "#059669",
    Icon: FileText,
  },
];
export default function FormCard({
  form,
  onView,
  onEdit,
  onBuild,
  onDelete,
  onArchive,
  onUnarchive,
}) {
  const { t } = useTranslation();
  const formatDate = (dateStr) => {
    if (!dateStr) return t("forms.recently", "Recently");
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return `${t("common.today", "Today")}, ${d.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      }
      return d.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };
  const fieldCount =
    form.fields_count ??
    (form.versions && form.versions.length > 0 && form.versions[0]?.fields
      ? form.versions[0].fields.length
      : 0);
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "published":
        return <Badge variant="success">{t("forms.status_published", t("formCard.published", "Published"))}</Badge>;
      case "archived":
        return <Badge variant="danger">{t("forms.status_archived", t("formCard.archived", "Archived"))}</Badge>;
      case "draft":
      default:
        return <Badge variant="warning">{t("forms.status_draft", t("formCard.draft", "Draft"))}</Badge>;
    }
  };
  const badgeConfig = PASTEL_ICONS[(form.id || 0) % PASTEL_ICONS.length];
  const PastelIcon = badgeConfig.Icon;
  return (
    <div
      className="dashboard-form-card"
      style={{
        background: "#FFFFFF",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "1.5rem 1.75rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
        transition: "all 0.2s ease",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.25rem",
        }}
      >
        {/* Left Side: Large Pastel Icon + Form Title & Description */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "1.25rem",
            flex: 1,
            minWidth: "300px",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "16px",
              background: badgeConfig.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: "0.1rem",
            }}
          >
            <PastelIcon size={24} color={badgeConfig.color} />
          </div>

          <div
            style={{
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.35rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                <DynamicText text={form.title} />
              </h3>
            </div>

            <p
              style={{
                fontSize: "0.88rem",
                color: "#64748b",
                margin: "0 0 0.65rem 0",
                lineHeight: 1.5,
              }}
            >
              <DynamicText text={form.description || t("forms.no_description", t("formCard.noDescription", "No description provided"))} />
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                fontSize: "0.8rem",
                color: "#94a3b8",
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  color: "#475569",
                }}
              >
                {fieldCount} {fieldCount === 1 ? t("forms.field_singular", "field") : t("forms.fields_plural", t("formCard.fields", "fields"))}
              </span>
              <span>•</span>
              <span>
                {t("forms.updated_prefix", t("formCard.updated", "Updated "))}
                {formatDate(form.updatedat || form.createdat)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Status Badge + Horizontal Action Buttons */}
        <div
          className="dashboard-form-card-right"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "0.85rem",
          }}
        >
          <div>{getStatusBadge(form.status)}</div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            {onBuild && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={Wrench}
                onClick={() => onBuild(form.id, form.current_version)}
                title={t("forms.builder_title", t("formCard.openFormBuilder", "Open Form Builder"))}
                style={{
                  padding: "0.45rem 0.95rem",
                  fontWeight: 600,
                }}
              >
                {t("forms.builder", t("formCard.builder", "Builder"))}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              leftIcon={Eye}
              onClick={() => onView(form.id)}
              title={t("forms.view_title", t("formCard.viewFormDetails", "View Form Details"))}
              style={{
                padding: "0.45rem 0.85rem",
              }}
            >
              {t("forms.view", t("formCard.view", "View"))}
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={Edit3}
              onClick={() => onEdit(form)}
              title={t("forms.edit_title", t("formCard.editFormTitle", "Edit Form"))}
              style={{
                padding: "0.45rem 0.85rem",
              }}
            >
              {t("forms.edit", t("formCard.edit", "Edit"))}
            </Button>

            {form.status?.toLowerCase() !== "archived" && onArchive && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={Archive}
                onClick={() => onArchive(form)}
                title={t("forms.archive_title", t("formCard.archiveForm", "Archive Form"))}
                style={{
                  color: "#d97706",
                  borderColor: "#fef3c7",
                  padding: "0.45rem 0.85rem",
                }}
              >
                {t("forms.archive", t("formCard.archive", "Archive"))}
              </Button>
            )}

            {form.status?.toLowerCase() === "archived" && onUnarchive && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={Archive}
                onClick={() => onUnarchive(form)}
                title={t("forms.unarchive_title", t("formCard.unarchiveForm", "Unarchive Form"))}
                style={{
                  color: "#059669",
                  borderColor: "#d1fae5",
                  padding: "0.45rem 0.85rem",
                }}
              >
                {t("forms.unarchive", t("formCard.unarchive", "Unarchive"))}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              leftIcon={Trash2}
              onClick={() => onDelete(form)}
              title={t("forms.delete_title", t("formCard.deleteForm", "Delete Form"))}
              style={{
                color: "#dc2626",
                borderColor: "#fee2e2",
                padding: "0.45rem 0.85rem",
              }}
            >
              {t("forms.delete", t("formCard.delete", "Delete"))}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
