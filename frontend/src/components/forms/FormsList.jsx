import { useTranslation } from "react-i18next";
import React from "react";
import FormCard from "./FormCard";
import { FileText } from "lucide-react";
export default function FormsList({
  forms,
  onView,
  onEdit,
  onBuild,
  onDelete,
  onArchive,
  onUnarchive,
  onCreateClick,
}) {
  const { t } = useTranslation();
  if (!forms || forms.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <FileText size={36} />
        </div>
        <h3 className="empty-title">{t("formsList.noFormsFound")}</h3>
        <p className="empty-description">
          {t("formsList.youHavenTCreatedAny")}
        </p>
        {onCreateClick && (
          <button
            className="btn-primary"
            onClick={onCreateClick}
            style={{
              margin: "1rem auto 0 auto",
            }}
          >
            {t("formsList.createYourFirstForm")}
          </button>
        )}
      </div>
    );
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
      }}
    >
      {forms.map((form) => (
        <FormCard
          key={form.id}
          form={form}
          onView={onView}
          onEdit={onEdit}
          onBuild={onBuild}
          onDelete={onDelete}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
        />
      ))}
    </div>
  );
}
