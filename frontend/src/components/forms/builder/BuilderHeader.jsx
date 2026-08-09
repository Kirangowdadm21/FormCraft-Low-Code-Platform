import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  CheckCircle,
  AlertCircle,
  GitBranch,
  Copy,
  MoreVertical,
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <div className="builder-header-container">
      {/* Desktop Header (> 768px) */}
      <div className="builder-header-desktop">
        {/* Left Group */}
        <div className="builder-header-left">
          <Button
            className="builder-back-btn"
            variant="ghost"
            size="sm"
            leftIcon={ArrowLeft}
            onClick={handleBackClick}
          >
            {t("builderHeader.dashboard")}
          </Button>
          <div className="builder-header-divider" />
          <div className="builder-title-group">
            <h2 className="builder-form-title">
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
        <div className="builder-header-center">
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
        <div className="builder-header-right">
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

      {/* Mobile Header (<= 768px) */}
      <div className="builder-header-mobile">
        {/* Row 1: Back to Dashboard */}
        <div className="builder-header-mobile-row-1">
          <Button
            className="builder-back-btn"
            variant="ghost"
            size="sm"
            leftIcon={ArrowLeft}
            onClick={handleBackClick}
          >
            {t("builderHeader.dashboard")}
          </Button>
          {/* Auto save/dirty state in row 1 right side to keep user informed */}
          <div style={{ marginLeft: "auto" }}>
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
        </div>

        {/* Row 2: Title and Badges */}
        <div className="builder-header-mobile-row-2">
          <h2 className="builder-form-title">
            {form?.title || "Form Builder"}
          </h2>
          <div className="builder-header-badges">
            {activeVersion ? (
              <Badge variant="outline" icon={GitBranch}>
                v{activeVersion.version_number}
              </Badge>
            ) : (
              <Badge variant="neutral">{t("builderHeader.unsavedDraft")}</Badge>
            )}
            <Badge variant={form?.status === "published" ? "success" : "neutral"}>
              {form?.status?.toUpperCase() || "DRAFT"}
            </Badge>
          </div>
        </div>

        {/* Row 3: Action Buttons */}
        <div className="builder-header-mobile-row-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={Eye}
            onClick={onPreview}
            style={{ flex: 1 }}
          >
            {t("builderHeader.preview")}
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={Send}
            isLoading={publishing}
            disabled={publishing || saving}
            onClick={onPublish}
            style={{ flex: 1 }}
          >
            {t("builderHeader.publish")}
          </Button>
          <div className="overflow-menu-container" style={{ position: "relative" }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ padding: "0.4rem 0.6rem", height: "100%" }}
            >
              <MoreVertical size={16} />
            </Button>
            {isMenuOpen && (
              <div className="overflow-dropdown-menu">
                <button
                  onClick={() => {
                    onSave();
                    setIsMenuOpen(false);
                  }}
                  disabled={saving || !isDirty}
                  className="overflow-menu-item"
                >
                  <Save size={14} />
                  <span>{t("builderHeader.save")}</span>
                </button>
                <button
                  onClick={() => {
                    onSaveAsTemplate();
                    setIsMenuOpen(false);
                  }}
                  className="overflow-menu-item"
                >
                  <Copy size={14} />
                  <span>{t("builderHeader.saveAsTemplate")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
