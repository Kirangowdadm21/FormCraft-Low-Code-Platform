import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Copy, Trash2, Settings, ShieldAlert } from 'lucide-react';
import FieldRenderer from './FieldRenderer';

export default function FieldCard({
  field,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`canvas-field-card ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(field.id);
      }}
    >
      {/* Top drag & action bar */}
      <div className="card-top-bar">
        <div className="card-drag-handle" {...attributes} {...listeners} title="Drag to reorder">
          <GripVertical size={16} />
          <span className="card-type-tag">{field.field_type.toUpperCase()}</span>
        </div>

        <div className="card-actions">
          <button
            type="button"
            className="btn-card-icon"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(field.id);
            }}
            title="Duplicate field locally"
          >
            <Copy size={15} />
          </button>

          <button
            type="button"
            className="btn-card-icon danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(field.id);
            }}
            title="Delete field locally"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Field content preview */}
      <div className="card-field-preview">
        <FieldRenderer field={field} isPreview={false} />
      </div>
    </div>
  );
}
