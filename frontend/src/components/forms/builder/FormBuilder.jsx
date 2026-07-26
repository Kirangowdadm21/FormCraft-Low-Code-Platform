import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import {
  getFormById,
  getFormVersions,
  createFormVersion,
  getFieldsByVersion,
  publishForm,
} from '../../../services/formsApi';

import BuilderHeader from './BuilderHeader';
import FieldPalette from './FieldPalette';
import FormCanvas from './FormCanvas';
import FieldProperties from './FieldProperties';
import FormPreviewModal from './FormPreviewModal';
import SaveVersionModal from './SaveVersionModal';
import { Loader2, AlertCircle } from 'lucide-react';

export default function FormBuilder({ formId, initialVersionId, onBack }) {
  const [form, setForm] = useState(null);
  const [allVersions, setAllVersions] = useState([]);
  const [activeVersion, setActiveVersion] = useState(null);
  const [fields, setFields] = useState([]);
  const [originalFields, setOriginalFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState(null);

  // Setup dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Auto-dismiss notification after 4s
  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load form details & fields for specified or latest version
  const loadBuilderData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch form metadata
      const formResp = await getFormById(formId);
      setForm(formResp);

      // 2. Fetch form versions list
      let versions = await getFormVersions(formId);
      if (!versions || versions.length === 0) {
        const initialVer = await createFormVersion(formId, 1, [], false);
        versions = [initialVer];
      }
      setAllVersions(versions);

      // 3. Determine target version to load
      let versionToUse = null;
      if (initialVersionId) {
        versionToUse = versions.find(
          (v) => v.id === initialVersionId || v.version_number === initialVersionId
        );
      }
      if (!versionToUse) {
        // Pick latest version by highest version_number
        versionToUse = [...versions].sort((a, b) => b.version_number - a.version_number)[0];
      }
      setActiveVersion(versionToUse);

      // 4. Fetch existing fields for this specific version
      if (versionToUse && versionToUse.id) {
        const existingFields = await getFieldsByVersion(versionToUse.id);
        const mapped = (existingFields || []).map((f) => ({
          ...f,
          id: String(f.id),
          dbId: f.id,
          options: f.options || [],
        }));

        mapped.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

        setFields(mapped);
        setOriginalFields(mapped);
      } else {
        setFields([]);
        setOriginalFields([]);
      }

      setIsDirty(false);
    } catch (err) {
      console.error('Error loading form builder:', err);
      setError(err.message || 'Failed to load form builder data');
    } finally {
      setLoading(false);
    }
  }, [formId, initialVersionId]);

  useEffect(() => {
    if (formId) {
      loadBuilderData();
    }
  }, [formId, loadBuilderData]);

  // Helper to construct a local field object
  const createLocalField = (type, defaultLabel, defaultOptions) => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const fieldCount = fields.length + 1;
    const label = defaultLabel || `Untitled ${type}`;
    const fieldName = `${type}_${Date.now().toString().slice(-4)}`;

    let formattedOptions = [];
    if (defaultOptions && Array.isArray(defaultOptions)) {
      formattedOptions = defaultOptions.map((opt, i) => ({
        optiontext: typeof opt === 'string' ? opt : opt.optiontext || `Option ${i + 1}`,
        value: typeof opt === 'string' ? opt.toLowerCase().replace(/\s+/g, '_') : opt.value,
        display_order: i + 1,
      }));
    }

    return {
      id: tempId,
      dbId: null,
      field_type: type,
      label,
      field_name: fieldName,
      placeholder: '',
      help_text: '',
      required: false,
      width: 'full',
      display_order: fieldCount,
      options: formattedOptions,
      validation_conf: null,
    };
  };

  // Add field to canvas locally
  const handleAddField = (type, defaultLabel, defaultOptions) => {
    const newField = createLocalField(type, defaultLabel, defaultOptions);
    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newField.id);
    setIsDirty(true);
  };

  // Duplicate field locally
  const handleDuplicateField = (fieldId) => {
    const targetIdx = fields.findIndex((f) => f.id === fieldId);
    if (targetIdx === -1) return;

    const source = fields[targetIdx];
    const clone = {
      ...source,
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      dbId: null,
      label: `${source.label} (Copy)`,
      field_name: `${source.field_name}_copy`,
      display_order: targetIdx + 2,
      options: Array.isArray(source.options)
        ? source.options.map((o) => ({ ...o, id: undefined }))
        : [],
    };

    const newFields = [...fields];
    newFields.splice(targetIdx + 1, 0, clone);

    newFields.forEach((f, idx) => {
      f.display_order = idx + 1;
    });

    setFields(newFields);
    setSelectedFieldId(clone.id);
    setIsDirty(true);
  };

  // Delete field locally
  const handleDeleteField = (fieldId) => {
    setFields((prev) => {
      const filtered = prev.filter((f) => f.id !== fieldId);
      filtered.forEach((f, idx) => {
        f.display_order = idx + 1;
      });
      return filtered;
    });

    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
    setIsDirty(true);
  };

  // Update properties locally
  const handleUpdateField = (fieldId, updates) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === fieldId) {
          return { ...f, ...updates };
        }
        return f;
      })
    );
    setIsDirty(true);
  };

  // Drag and Drop handlers
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveDragItem(active.data.current);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    // Palette drag -> Canvas
    if (active.data.current?.isPaletteItem) {
      const { fieldType, defaultLabel, defaultOptions } = active.data.current;
      const newField = createLocalField(fieldType, defaultLabel, defaultOptions);
      setFields((prev) => [...prev, newField]);
      setSelectedFieldId(newField.id);
      setIsDirty(true);
      return;
    }

    // Re-ordering canvas items
    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const rearranged = arrayMove(items, oldIndex, newIndex);
        rearranged.forEach((f, idx) => {
          f.display_order = idx + 1;
        });
        return rearranged;
      });
      setIsDirty(true);
    }
  };

  // Calculate next version number
  const currentVersionNumber = activeVersion ? activeVersion.version_number : 1;
  const maxVersionNumber = allVersions.length > 0
    ? Math.max(...allVersions.map((v) => v.version_number || 0))
    : currentVersionNumber;
  const nextVersionNumber = maxVersionNumber + 1;

  // Open Save Confirmation Dialog
  const handleInitiateSave = () => {
    setIsSaveModalOpen(true);
  };

  // Execute Save as NEW Version
  const handleConfirmSaveNewVersion = async () => {
    try {
      setSaving(true);
      setError(null);

      const payloadFields = fields.map((f, i) => ({
        label: f.label || `Field ${i + 1}`,
        field_name: f.field_name || `field_${i + 1}`,
        field_type: f.field_type,
        placeholder: f.placeholder || null,
        help_text: f.help_text || null,
        required: !!f.required,
        width: f.width || 'full',
        display_order: i + 1,
        validation_conf: f.validation_conf || null,
        options: Array.isArray(f.options)
          ? f.options.map((opt, optIdx) => ({
              optiontext: typeof opt === 'object' ? opt.optiontext || `Option ${optIdx + 1}` : String(opt),
              value: typeof opt === 'object' ? opt.value || `opt_${optIdx + 1}` : String(opt),
              display_order: optIdx + 1,
            }))
          : null,
      }));

      // Call POST /forms/{id}/versions to create brand new version
      const createdVersion = await createFormVersion(
        formId,
        nextVersionNumber,
        payloadFields,
        false
      );

      // Update state to point to new version
      setAllVersions((prev) => [createdVersion, ...prev]);
      setActiveVersion(createdVersion);

      const freshFields = (createdVersion.fields || []).map((f) => ({
        ...f,
        id: String(f.id),
        dbId: f.id,
        options: f.options || [],
      }));
      freshFields.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

      setFields(freshFields);
      setOriginalFields(freshFields);
      setIsDirty(false);
      setIsSaveModalOpen(false);
      showNotification(`Version ${createdVersion.version_number} created successfully!`, 'success');
    } catch (err) {
      console.error('Error creating new version:', err);
      setError(err.message || 'Failed to create new form version');
    } finally {
      setSaving(false);
    }
  };

  // Publish form version
  const handlePublish = async () => {
    try {
      setPublishing(true);
      setError(null);

      // Save as new version first if there are pending modifications
      if (isDirty) {
        await handleConfirmSaveNewVersion();
      }

      const versionToPublish = activeVersion ? activeVersion.version_number : null;
      const res = await publishForm(formId, versionToPublish);
      setForm((prev) => ({ ...prev, status: res.status || 'published' }));
      setActiveVersion((prev) => (prev ? { ...prev, ispublished: true } : prev));
      showNotification(`Form version v${versionToPublish} published successfully!`, 'success');
    } catch (err) {
      console.error('Error publishing form:', err);
      setError(err.message || 'Failed to publish form version');
    } finally {
      setPublishing(false);
    }
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  if (loading) {
    return (
      <div style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: 'var(--primary)' }} />
        <p style={{ fontSize: '1rem' }}>Loading Form Builder environment...</p>
      </div>
    );
  }

  return (
    <div className="builder-layout-container">
      {/* Top Header Navigation */}
      <BuilderHeader
        form={form}
        activeVersion={activeVersion}
        isDirty={isDirty}
        saving={saving}
        publishing={publishing}
        onSave={handleInitiateSave}
        onPublish={handlePublish}
        onPreview={() => setIsPreviewOpen(true)}
        onBack={onBack}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="modal-error" style={{ margin: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Main 3-Panel Workspace */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="builder-panels-row">
          {/* Left Panel: Field Palette */}
          <FieldPalette onAddField={handleAddField} />

          {/* Center Panel: Form Canvas Drop Area */}
          <FormCanvas
            fields={fields}
            selectedFieldId={selectedFieldId}
            onSelectField={(id) => setSelectedFieldId(id)}
            onDuplicateField={handleDuplicateField}
            onDeleteField={handleDeleteField}
            onCanvasClick={() => setSelectedFieldId(null)}
          />

          {/* Right Panel: Field Properties Config */}
          <FieldProperties
            selectedField={selectedField}
            onUpdateField={handleUpdateField}
          />
        </div>

        {/* Drag Overlay for visual feedback */}
        <DragOverlay>
          {activeDragItem ? (
            <div className="palette-item dragging">
              <span>Dragging {activeDragItem.fieldType || 'Field'}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Live Respondent Preview Modal */}
      <FormPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        form={form}
        fields={fields}
      />

      {/* Save Confirmation Dialog: Save as New Version */}
      <SaveVersionModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onConfirm={handleConfirmSaveNewVersion}
        currentVersionNumber={currentVersionNumber}
        nextVersionNumber={nextVersionNumber}
        saving={saving}
      />
    </div>
  );
}
