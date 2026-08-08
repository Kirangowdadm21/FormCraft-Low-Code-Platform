import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  Layers,
  Sparkles,
} from "lucide-react";
import { listTemplates } from "../services/templatesApi";
import TemplateCard from "../components/templates/TemplateCard";
import CreateTemplateModal from "../components/templates/CreateTemplateModal";
import EditTemplateModal from "../components/templates/EditTemplateModal";
import PreviewTemplateModal from "../components/templates/PreviewTemplateModal";
import UseTemplateModal from "../components/templates/UseTemplateModal";
import DeleteTemplateDialog from "../components/templates/DeleteTemplateDialog";
import FormBuilder from "../components/forms/builder/FormBuilder";
import Button from "../components/common/Button";
import { SearchInput, Select } from "../components/common/Input";
import EmptyState from "../components/common/EmptyState";
import { TemplatesSkeleton } from "../components/common/PageSkeletons";
import { useTranslation } from "react-i18next";

export default function TemplatesPage({ onNavigateToPublished }) {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Modal & Builder states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [usingTemplate, setUsingTemplate] = useState(null);
  const [deletingTemplate, setDeletingTemplate] = useState(null);

  // Active form building state after "Use Template"
  const [buildingFormId, setBuildingFormId] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listTemplates("", 0, 100);
      setTemplates(data || []);
    } catch (err) {
      console.error("Error loading templates:", err);
      setError(err.message || "Failed to load templates from backend");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Event Handlers
  const handleTemplateCreated = (newTemplate) => {
    showNotification(`Template "${newTemplate.title}" created successfully.`);
    loadTemplates();
  };

  const handleTemplateUpdated = (updatedTemplate) => {
    showNotification(
      `Template "${updatedTemplate.title}" updated successfully.`,
    );
    loadTemplates();
  };

  const handleTemplateDeleted = (deletedId) => {
    showNotification("Template deleted successfully.");
    loadTemplates();
  };

  const handleFormCreatedFromTemplate = (newForm) => {
    showNotification(
      `Form "${newForm.title}" created from template! Launching Form Builder...`,
    );
    setBuildingFormId(newForm.id);
  };

  // Search & Filtered/Sorted templates
  const filteredTemplates = useMemo(() => {
    let result = templates.filter((template) => {
      const q = searchQuery.toLowerCase();
      const matchesTitle = template.title?.toLowerCase().includes(q);
      const matchesDesc = template.description?.toLowerCase().includes(q);
      return matchesTitle || matchesDesc;
    });

    switch (sortBy) {
      case "oldest":
        result.sort((a, b) => new Date(a.createdat) - new Date(b.createdat));
        break;
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "fields":
        result.sort(
          (a, b) => (b.fields?.length || 0) - (a.fields?.length || 0),
        );
        break;
      case "newest":
      default:
        result.sort((a, b) => new Date(b.createdat) - new Date(a.createdat));
        break;
    }

    return result;
  }, [templates, searchQuery, sortBy]);

  // Total statistics
  const stats = useMemo(() => {
    const totalTemplates = templates.length;
    const totalFields = templates.reduce(
      (acc, t) => acc + (t.fields?.length || 0),
      0,
    );
    return { totalTemplates, totalFields };
  }, [templates]);

  // If a newly created form from template is launching, render FormBuilder view
  if (buildingFormId) {
    return (
      <FormBuilder
        formId={buildingFormId}
        onBack={() => {
          setBuildingFormId(null);
          loadTemplates();
        }}
        onNavigateToPublished={onNavigateToPublished}
      />
    );
  }

  return (
    <div style={{ paddingBottom: "2.5rem" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.85rem",
              fontWeight: 800,
              color: "#0f172a",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            {t("templates.title")}
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#64748b",
              margin: "0.25rem 0 0 0",
            }}
          >
            {t("templates.subtitle")}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button
            variant="outline"
            onClick={loadTemplates}
            isLoading={loading}
            leftIcon={RefreshCw}
          >
            {t("common.refresh", "Refresh")}
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={Plus}
          >
            {t("templates.create_btn", t("templates.create_template", "Create Template"))}
          </Button>
        </div>
      </div>

      {/* Summary Stats Strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          marginBottom: "1.5rem",
          fontSize: "0.82rem",
          color: "#64748b",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontWeight: 600 }}>
            {t("templates.total_templates_label", t("templatesPage.totalTemplates", "Total Templates:"))}
          </span>
          <strong style={{ color: "#0f172a", fontWeight: 800 }}>
            {stats.totalTemplates || 2}
          </strong>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ color: "#059669", fontWeight: 700 }}>•</span>
          <span style={{ fontWeight: 600 }}>
            {t("templates.preconfigured_fields_label", t("templatesPage.preConfiguredFields", "Pre-configured Fields:"))}
          </span>
          <strong style={{ color: "#0f172a", fontWeight: 800 }}>
            {stats.totalFields || 6}
          </strong>
        </div>
      </div>

      {/* Controls Bar: Search & Sort */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1 }}>
          <SearchInput
            placeholder={t("templates.search_placeholder", t("templatesPage.searchTemplatesByTitle", "Search templates by title or description..."))}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ width: "200px" }}>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">{t("templates.sort_newest", t("templatesPage.sortByNewest", "Sort by Newest"))}</option>
            <option value="oldest">{t("templates.sort_oldest", t("templatesPage.sortByOldest", "Sort by Oldest"))}</option>
            <option value="title">{t("templates.sort_title", t("templatesPage.sortByTitleAZ", "Sort by Title (A-Z)"))}</option>
            <option value="fields">
              {t("templates.sort_fields", t("templatesPage.sortByMostFields", "Sort by Most Fields"))}
            </option>
          </Select>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          className="modal-error"
          style={{
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadTemplates}
            style={{ marginLeft: "auto" }}
          >
            {t("templatesPage.retry")}
          </Button>
        </div>
      )}

      {/* Main Templates Display */}
      <div>
        {loading && <TemplatesSkeleton />}

        {!loading && filteredTemplates.length === 0 && (
          <EmptyState
            icon={Layers}
            title={searchQuery ? "No matching templates" : "No templates found"}
            description={
              searchQuery
                ? "Try adjusting your search terms."
                : "Create your first form template to speed up form creation across your organization."
            }
            action={
              !searchQuery && (
                <Button
                  variant="primary"
                  onClick={() => setIsCreateModalOpen(true)}
                  leftIcon={Plus}
                >
                  {t("templatesPage.createFirstTemplate")}
                </Button>
              )
            }
          />
        )}

        {!loading && filteredTemplates.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
              gap: "1.25rem",
            }}
          >
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onPreview={(tpl) => setPreviewTemplate(tpl)}
                onUse={(tpl) => setUsingTemplate(tpl)}
                onEdit={(tpl) => setEditingTemplate(tpl)}
                onDelete={(tpl) => setDeletingTemplate(tpl)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTemplateCreated={handleTemplateCreated}
      />

      <EditTemplateModal
        isOpen={!!editingTemplate}
        template={editingTemplate}
        onClose={() => setEditingTemplate(null)}
        onTemplateUpdated={handleTemplateUpdated}
      />

      <PreviewTemplateModal
        isOpen={!!previewTemplate}
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUse={(tpl) => {
          setPreviewTemplate(null);
          setUsingTemplate(tpl);
        }}
      />

      <UseTemplateModal
        isOpen={!!usingTemplate}
        template={usingTemplate}
        onClose={() => setUsingTemplate(null)}
        onFormCreated={handleFormCreatedFromTemplate}
      />

      <DeleteTemplateDialog
        isOpen={!!deletingTemplate}
        template={deletingTemplate}
        onClose={() => setDeletingTemplate(null)}
        onTemplateDeleted={handleTemplateDeleted}
      />
    </div>
  );
}
