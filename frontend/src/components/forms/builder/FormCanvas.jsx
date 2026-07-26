import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { PlusCircle, Sparkles } from 'lucide-react';
import FieldCard from './FieldCard';

export default function FormCanvas({
  fields,
  selectedFieldId,
  onSelectField,
  onDuplicateField,
  onDeleteField,
  onCanvasClick,
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'canvas-droppable',
  });

  return (
    <div
      className="builder-panel center-panel"
      onClick={onCanvasClick}
    >
      <div className="canvas-wrapper">
        <div
          ref={setNodeRef}
          className={`canvas-drop-area ${isOver ? 'drop-active' : ''}`}
        >
          {fields.length === 0 ? (
            <div className="canvas-empty-state">
              <div className="empty-sparkle-icon">
                <Sparkles size={32} color="var(--primary)" />
              </div>
              <h4>Drag fields here to start building your form</h4>
              <p>Choose field types from the left palette or click any item to add it directly to your canvas.</p>
            </div>
          ) : (
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="canvas-fields-container">
                {fields.map((field) => (
                  <FieldCard
                    key={field.id}
                    field={field}
                    isSelected={field.id === selectedFieldId}
                    onSelect={onSelectField}
                    onDuplicate={onDuplicateField}
                    onDelete={onDeleteField}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>
      </div>
    </div>
  );
}
