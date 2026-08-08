import { useTranslation } from "react-i18next";
import React, { useState, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  Type,
  AlignLeft,
  Mail,
  Hash,
  Phone,
  Calendar,
  CheckSquare,
  CircleDot,
  ChevronDownSquare,
  UploadCloud,
  Star,
  PenTool,
  MousePointerClick,
  GripVertical,
} from "lucide-react";
import { SearchInput } from "../../common/Input";
export const FIELD_DEFINITIONS = [
  {
    type: "text",
    label: "Single Line Text",
    defaultLabel: "Short Answer",
    icon: Type,
  },
  {
    type: "textarea",
    label: "Paragraph Text",
    defaultLabel: "Long Answer",
    icon: AlignLeft,
  },
  {
    type: "email",
    label: "Email Address",
    defaultLabel: "Email",
    icon: Mail,
  },
  {
    type: "number",
    label: "Number Input",
    defaultLabel: "Quantity / Score",
    icon: Hash,
  },
  {
    type: "phone",
    label: "Phone Number",
    defaultLabel: "Phone",
    icon: Phone,
  },
  {
    type: "date",
    label: "Date Picker",
    defaultLabel: "Select Date",
    icon: Calendar,
  },
  {
    type: "checkbox",
    label: "Checkbox Options",
    defaultLabel: "Select Multiple",
    icon: CheckSquare,
    defaultOptions: ["Option 1", "Option 2", "Option 3"],
  },
  {
    type: "radio",
    label: "Radio Choices",
    defaultLabel: "Select One Choice",
    icon: CircleDot,
    defaultOptions: ["Choice A", "Choice B", "Choice C"],
  },
  {
    type: "dropdown",
    label: "Dropdown List",
    defaultLabel: "Choose an Option",
    icon: ChevronDownSquare,
    defaultOptions: ["First Choice", "Second Choice", "Third Choice"],
  },
  {
    type: "file_upload",
    label: "File Upload",
    defaultLabel: "Upload File / Document",
    icon: UploadCloud,
  },
  {
    type: "rating",
    label: "Star Rating",
    defaultLabel: "Satisfaction Rating",
    icon: Star,
  },
  {
    type: "signature",
    label: "E-Signature",
    defaultLabel: "Signature Required",
    icon: PenTool,
  },
  {
    type: "submit",
    label: "Submit Button",
    defaultLabel: "Submit Form",
    icon: MousePointerClick,
  },
];
function PaletteItem({ def, onAddField }) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `palette-${def.type}`,
      data: {
        isPaletteItem: true,
        fieldType: def.type,
        defaultLabel: def.defaultLabel,
        defaultOptions: def.defaultOptions,
      },
    });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 999 : "auto",
      }
    : undefined;
  const IconComponent = def.icon;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`palette-item ${isDragging ? "dragging" : ""}`}
      onClick={() => onAddField(def.type, def.defaultLabel, def.defaultOptions)}
      title={t("fieldPalette.clickOrDragInto")}
    >
      <GripVertical size={14} className="palette-grip" />
      <div className="palette-icon-wrapper">
        <IconComponent size={16} />
      </div>
      <span className="palette-item-label">{def.label}</span>
    </div>
  );
}
export default function FieldPalette({ onAddField }) {
  const { t } = useTranslation();
  const [filterQuery, setFilterQuery] = useState("");
  const filteredDefs = useMemo(() => {
    if (!filterQuery.trim()) return FIELD_DEFINITIONS;
    const q = filterQuery.toLowerCase();
    return FIELD_DEFINITIONS.filter(
      (def) =>
        def.label.toLowerCase().includes(q) ||
        def.type.toLowerCase().includes(q),
    );
  }, [filterQuery]);
  return (
    <div className="builder-panel left-panel">
      <div
        className="panel-header"
        style={{
          marginBottom: "0.75rem",
        }}
      >
        <h3>{t("fieldPalette.fieldPalette")}</h3>
        <span className="panel-subtitle">
          {t("fieldPalette.dragFieldsOrClick")}
        </span>
      </div>

      <div
        style={{
          marginBottom: "1rem",
        }}
      >
        <SearchInput
          placeholder={t("fieldPalette.filterFieldTypes")}
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
        />
      </div>

      <div className="palette-section">
        <div className="palette-grid">
          {filteredDefs.map((def) => (
            <PaletteItem key={def.type} def={def} onAddField={onAddField} />
          ))}
        </div>
      </div>
    </div>
  );
}
