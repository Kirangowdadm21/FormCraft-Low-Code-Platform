import { useTranslation } from "react-i18next";
import React from "react";
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  CheckCircle,
  AlertCircle,
  GitBranch,
  Copy,
} from "lucide-react";
import Button from "../../common/Button";
import Badge from "../../common/Badge";
export default function BuilderHeader({
  form,
  activeVersion,
  isDirty,
  saving,
  publishing,
  onSave,
  onPublish,
  onPreview,
  onBack,
  onSaveAsTemplate,
}) {
  const { t } = useTranslation();
  const handleBackClick = () => {
    if (isDirty) {
      if (
        window.confirm(
          "You have unsaved changes in the form builder. Discard changes and exit to dashboard?",
        )
      ) {
        onBack();
      }
    } else {
      onBack();
    }
  };
  return (
    <div
      className="builder-header"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem 1.5rem",
        background: "#FFFFFF",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      {/* Left Group */}
      <div
        className="builder-header-left"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          leftIcon={ArrowLeft}
          onClick={handleBackClick}
        >
          {t("builderHeader.dashboard")}
        </Button>
        <div
          style={{
            height: "20px",
            width: "1px",
            background: "var(--rule)",
          }}
        />
        <div
          className="builder-title-group"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <h2
            className="builder-form-title"
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              margin: 0,
            }}
          >
            {form?.title || "Form Builder"}
          </h2>
          {activeVersion ? (
            <Badge variant="outline" icon={GitBranch}>
              {t("builderHeader.v")}
              {activeVersion.version_number}
            </Badge>
          ) : (
            <Badge variant="neutral">{t("builderHeader.unsavedDraft")}</Badge>
          )}
          <Badge variant={form?.status === "published" ? "success" : "neutral"}>
            {form?.status?.toUpperCase() || "DRAFT"}
          </Badge>
        </div>
      </div>

      {/* Center Group: Auto-save status */}
      <div
        className="builder-header-center"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
        }}
      >
        {isDirty ? (
          <Badge variant="warning" icon={AlertCircle}>
            {t("builderHeader.unsavedChanges")}
          </Badge>
        ) : activeVersion ? (
          <Badge variant="success" icon={CheckCircle}>
            {t("builderHeader.allChangesSaved")}
          </Badge>
        ) : null}
      </div>

      {/* Right Group */}
      <div
        className="builder-header-right"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <Button variant="outline" size="sm" leftIcon={Eye} onClick={onPreview}>
          {t("builderHeader.preview")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={Copy}
          onClick={onSaveAsTemplate}
        >
          {t("builderHeader.saveAsTemplate")}
        </Button>
        <Button
          variant="primary"
          size="sm"
          leftIcon={Send}
          isLoading={publishing}
          disabled={publishing || saving}
          onClick={onPublish}
        >
          {t("builderHeader.publish")}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={Save}
          isLoading={saving}
          disabled={saving || !isDirty}
          onClick={onSave}
        >
          {t("builderHeader.save")}
        </Button>
      </div>
    </div>
  );
}
