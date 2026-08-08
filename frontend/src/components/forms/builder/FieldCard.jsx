import { useTranslation } from "react-i18next";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Copy, Trash2 } from "lucide-react";
import FieldRenderer from "./FieldRenderer";
import Badge from "../../common/Badge";
import Button from "../../common/Button";
export default function FieldCard({
  field,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
}) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`canvas-field-card ${isSelected ? "selected" : ""} ${isDragging ? "dragging" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(field.id);
      }}
    >
      {/* Top drag & action bar */}
      <div
        className="card-top-bar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}
      >
        <div
          className="card-drag-handle"
          {...attributes}
          {...listeners}
          title={t("fieldCard.dragToReorder")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "grab",
          }}
        >
          <GripVertical
            size={16}
            style={{
              color: "var(--text-muted)",
            }}
          />
          <Badge variant="outline">{field.field_type.toUpperCase()}</Badge>
          {field.required && (
            <Badge variant="warning">{t("fieldCard.required")}</Badge>
          )}
        </div>

        <div
          className="card-actions"
          style={{
            display: "flex",
            gap: "0.25rem",
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            leftIcon={Copy}
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(field.id);
            }}
            title={t("fieldCard.duplicateField")}
          />

          <Button
            variant="danger"
            size="sm"
            leftIcon={Trash2}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(field.id);
            }}
            title={t("fieldCard.deleteField")}
          />
        </div>
      </div>

      {/* Field content preview */}
      <div className="card-field-preview">
        <FieldRenderer field={field} isPreview={false} />
      </div>
    </div>
  );
}
