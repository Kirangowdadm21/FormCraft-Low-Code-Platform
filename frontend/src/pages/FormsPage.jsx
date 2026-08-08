import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  FileText,
  Globe,
  Copy,
  Check,
  Eye,
  QrCode,
  ExternalLink,
  ArrowUpRight,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  LayoutGrid,
  List,
  Activity,
  Archive,
} from "lucide-react";
import { getForms, getFormVersions, unarchiveForm } from "../services/formsApi";
import { getSubmissions } from "../services/responsesApi";
import { useAuth } from "../context/AuthContext";

import FormsList from "../components/forms/FormsList";
import CreateFormModal from "../components/forms/CreateFormModal";
import EditFormModal from "../components/forms/EditFormModal";
import DeleteFormDialog from "../components/forms/DeleteFormDialog";
import ArchiveFormDialog from "../components/forms/ArchiveFormDialog";
import FormDetailModal from "../components/forms/FormDetailModal";
import FormBuilder from "../components/forms/builder/FormBuilder";
import PublishedFormDetailModal from "../components/forms/PublishedFormDetailModal";
import PublicFormQRModal from "../components/forms/PublicFormQRModal";

import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Card from "../components/common/Card";
import Modal from "../components/common/Modal";
import { SearchInput, Select } from "../components/common/Input";
import { FormsSkeleton } from "../components/common/PageSkeletons";
import EmptyState from "../components/common/EmptyState";
import DynamicText from "../components/common/DynamicText";
import { safeCopyText } from "../utils/clipboard";
import { useToast } from "../components/common/Toast";
import { useTranslation } from "react-i18next";

const PASTEL_ICONS = [
  { bg: "#e0f2fe", color: "#0284c7", Icon: FileText },
  { bg: "#fef3c7", color: "#d97706", Icon: Globe },
  { bg: "#f3e8ff", color: "#7e22ce", Icon: FileText },
  { bg: "#ffe4e6", color: "#e11d48", Icon: Globe },
  { bg: "#d1fae5", color: "#059669", Icon: FileText },
];

export default function FormsPage({ initialSubTab = "all" }) {
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useTranslation();

  // Active Sub-Tab: 'all' or 'published'
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);

  const [forms, setForms] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [allAuditLogs, setAllAuditLogs] = useState([]);
  const [isActivityLogModalOpen, setIsActivityLogModalOpen] = useState(false);
  const [activityLogSearch, setActivityLogSearch] = useState("");
  const [activityLogFilter, setActivityLogFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  // Clipboard & Published Modals state
  const [copiedId, setCopiedId] = useState(null);
  const [detailFormId, setDetailFormId] = useState(null);
  const [qrForm, setQrForm] = useState(null);

  // All Forms Modals & Builder state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [deletingForm, setDeletingForm] = useState(null);
  const [archivingForm, setArchivingForm] = useState(null);
  const [viewingFormId, setViewingFormId] = useState(null);
  const [buildingFormId, setBuildingFormId] = useState(null);
  const [buildingVersionId, setBuildingVersionId] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  // Generate Audit Rail Logs
  const generateAuditLogs = useCallback(
    async (formsList) => {
      try {
        const logs = [];
        const subList = await getSubmissions(null, 0, 100).catch(() => []);

        const versionToTitle = {};
        if (formsList && formsList.length > 0) {
          await Promise.all(
            formsList.map(async (form) => {
              try {
                const vers = await getFormVersions(form.id);
                if (vers) {
                  vers.forEach((v) => {
                    versionToTitle[v.id] = form.title;
                  });
                }
              } catch {
                // ignore per-form error
              }
            }),
          );
        }

        (subList || []).forEach((sub) => {
          const title = versionToTitle[sub.form_version] || "Form";
          logs.push({
            id: `SUB-${sub.id}`,
            type: "submission",
            formTitle: title,
            submissionId: sub.submission_id || sub.id,
            author: sub.submitted_by ? `User #${sub.submitted_by}` : null,
            timestamp: sub.submitted_at || sub.started_at,
          });
        });

        (formsList || []).forEach((form) => {
          const isPub = form.status?.toLowerCase() === "published";
          logs.push({
            id: isPub ? `PUB-${form.id}` : `FRM-${form.id}`,
            type: isPub ? "published" : "created",
            formTitle: form.title,
            version: form.current_version || 1,
            author: user
              ? [user.first_name, user.last_name].filter(Boolean).join(" ") ||
                "Kiran DM"
              : "Kiran DM",
            timestamp: form.updatedat || form.createdat,
          });
        });

        logs.sort(
          (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0),
        );
        setAuditLogs(logs.slice(0, 5));
        setAllAuditLogs(logs);
      } catch (err) {
        console.error("Error generating audit logs:", err);
      }
    },
    [user],
  );

  // Filtered activity logs for modal
  const filteredActivityLogs = useMemo(() => {
    let list = allAuditLogs;
    if (activityLogFilter !== "ALL") {
      list = list.filter((l) => l.type?.toUpperCase() === activityLogFilter);
    }
    if (activityLogSearch.trim()) {
      const q = activityLogSearch.toLowerCase();
      list = list.filter(
        (l) =>
          l.title?.toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q) ||
          l.author?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [allAuditLogs, activityLogFilter, activityLogSearch]);

  // Load forms
  const loadForms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getForms(0, 200);
      const formArray = data || [];
      setForms(formArray);
      generateAuditLogs(formArray);
    } catch (err) {
      console.error("Error loading forms:", err);
      setError(err.message || "Failed to load forms from backend");
    } finally {
      setLoading(false);
    }
  }, [generateAuditLogs]);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  // Handlers for mutations
  const handleFormCreated = (newForm) => {
    setForms((prev) => [newForm, ...prev]);
    loadForms();
    if (newForm && (newForm.id || newForm.form_id)) {
      setBuildingFormId(newForm.id || newForm.form_id);
    }
  };

  const handleFormUpdated = (updatedForm) => {
    setForms((prev) =>
      prev.map((f) => (f.id === updatedForm.id ? updatedForm : f)),
    );
    loadForms();
  };

  const handleFormDeleted = (deletedId) => {
    setForms((prev) => prev.filter((f) => f.id !== deletedId));
    setNotification({ msg: "Form deleted successfully.", type: "success" });
    setTimeout(() => setNotification(null), 4000);
    loadForms();
  };

  const handleFormArchived = (archivedId) => {
    setForms((prev) =>
      prev.map((f) => (f.id === archivedId ? { ...f, status: "archived" } : f)),
    );
    setNotification({ msg: "Form archived successfully.", type: "success" });
    setTimeout(() => setNotification(null), 4000);
    loadForms();
  };

  const handleFormUnarchive = async (form) => {
    try {
      await unarchiveForm(form.id);
      setForms((prev) =>
        prev.map((f) => (f.id === form.id ? { ...f, status: "draft" } : f)),
      );
      setNotification({ msg: "Form restored from archive successfully.", type: "success" });
      setTimeout(() => setNotification(null), 4000);
      loadForms();
    } catch (err) {
      setNotification({ msg: err.message || "Failed to restore form", type: "error" });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Filtered Forms for 'All Forms' Tab
  const filteredAllForms = useMemo(() => {
    let filtered = forms.filter((form) => {
      const matchesSearch =
        form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (form.description &&
          form.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" ||
        form.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    switch (sortBy) {
      case "oldest":
        filtered.sort(
          (a, b) => new Date(a.createdat || 0) - new Date(b.createdat || 0),
        );
        break;
      case "name-asc":
        filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "name-desc":
        filtered.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        break;
      case "newest":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.updatedat || b.createdat || 0) -
            new Date(a.updatedat || a.createdat || 0),
        );
        break;
    }

    return filtered;
  }, [forms, searchQuery, statusFilter, sortBy]);

  // Filtered Forms for 'Published Forms' Tab
  const filteredPublishedForms = useMemo(() => {
    let filtered = forms.filter((f) => f.status?.toLowerCase() === "published");

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.title?.toLowerCase().includes(q) ||
          f.description?.toLowerCase().includes(q),
      );
    }

    switch (sortBy) {
      case "oldest":
        filtered.sort(
          (a, b) => new Date(a.createdat || 0) - new Date(b.createdat || 0),
        );
        break;
      case "name-asc":
        filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "name-desc":
        filtered.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        break;
      case "newest":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.updatedat || b.createdat || 0) -
            new Date(a.updatedat || a.createdat || 0),
        );
        break;
    }

    return filtered;
  }, [forms, searchQuery, sortBy]);

  // Clipboard & Navigation Helpers for Published Forms
  const getPublicUrl = (formId) =>
    `${window.location.origin}/#/public/forms/${formId}`;

  const handleOpenForm = (formId) => {
    window.location.hash = `/public/forms/${formId}`;
  };

  const handleCopyLink = (formId) => {
    const url = getPublicUrl(formId);
    safeCopyText(url).then(() => {
      setCopiedId(formId);
      if (toast && toast.success)
        toast.success("Public URL copied to clipboard");
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const publishedCount = forms.filter(
    (f) => f.status?.toLowerCase() === "published",
  ).length;

  // Render Form Builder view if building a form
  if (buildingFormId) {
    return (
      <FormBuilder
        formId={buildingFormId}
        initialVersionId={buildingVersionId}
        onBack={() => {
          setBuildingFormId(null);
          setBuildingVersionId(null);
          loadForms();
        }}
        onNavigateToPublished={() => setActiveSubTab("published")}
      />
    );
  }

  return (
    <div className="forms-page-container" style={{ paddingBottom: "2rem" }}>
      {/* Header */}
      <div className="header" style={{ marginBottom: "1.25rem" }}>
        <div className="header-title">
          {activeSubTab === "published" && (
            <div
              style={{
                fontSize: "0.8rem",
                color: "#64748b",
                marginBottom: "0.25rem",
              }}
            >
              {t("forms.title")}
              {t("formsPage.text")}
              <strong style={{ color: "#4F46E5" }}>
                {t("forms.published_forms")}
              </strong>
            </div>
          )}
          <h1
            style={{
              fontSize: "1.85rem",
              fontWeight: 800,
              color: "var(--ink)",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            {activeSubTab === "published"
              ? t("forms.published_forms")
              : t("forms.title")}
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#64748b",
              margin: "0.25rem 0 0 0",
            }}
          >
            {activeSubTab === "published"
              ? t("forms.published_forms")
              : t(
                  "forms.subtitle",
                  "Create, manage and organize your forms in one place.",
                )}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={Plus}
          >
            {t("forms.create_btn")}
          </Button>
        </div>
      </div>

      {/* Two Sub-Tab Cards Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Card 1: All Forms */}
        <div
          onClick={() => setActiveSubTab("all")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1.1rem 1.25rem",
            borderRadius: "16px",
            cursor: "pointer",
            background: activeSubTab === "all" ? "#EEF2FF" : "#FFFFFF",
            border:
              activeSubTab === "all"
                ? "2px solid #4F46E5"
                : "1px solid #e2e8f0",
            transition: "all 0.15s ease",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: activeSubTab === "all" ? "#4F46E5" : "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FileText
              size={20}
              color={activeSubTab === "all" ? "#ffffff" : "#64748b"}
            />
          </div>
          <div>
            <div
              style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}
            >
              {t("forms.all_forms")}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
              {t("forms.all_tab")}
            </div>
          </div>
        </div>

        {/* Card 2: Published Forms */}
        <div
          onClick={() => setActiveSubTab("published")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1.1rem 1.25rem",
            borderRadius: "16px",
            cursor: "pointer",
            background: activeSubTab === "published" ? "#EEF2FF" : "#FFFFFF",
            border:
              activeSubTab === "published"
                ? "2px solid #4F46E5"
                : "1px solid #e2e8f0",
            transition: "all 0.15s ease",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: activeSubTab === "published" ? "#4F46E5" : "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Globe
              size={20}
              color={activeSubTab === "published" ? "#ffffff" : "#64748b"}
            />
          </div>
          <div>
            <div
              style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}
            >
              {t("forms.published_forms")}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
              {t("forms.published_tab")}
            </div>
          </div>
        </div>
      </div>

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
            onClick={loadForms}
            style={{ marginLeft: "auto" }}
          >
            {t("forms.retry")}
          </Button>
        </div>
      )}

      {/* SUB-TAB 1: ALL FORMS VIEW (Image 1) */}
      {activeSubTab === "all" && (
        <div className="forms-body-layout">
          {/* Left Column: Controls & Form Cards */}
          <div>
            {/* Status Filter Tab Pills */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "1rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {[
                { key: "ALL", label: t("forms.all_status", "All Forms"), icon: FileText },
                { key: "PUBLISHED", label: t("forms.status_published", "Published"), icon: Globe },
                { key: "DRAFT", label: t("forms.status_draft", "Draft"), icon: FileText },
                { key: "ARCHIVED", label: t("forms.status_archived", "Archived"), icon: Archive },
              ].map((pill) => {
                const isActive = statusFilter === pill.key;
                const IconComponent = pill.icon;
                return (
                  <button
                    key={pill.key}
                    type="button"
                    onClick={() => setStatusFilter(pill.key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.45rem 0.9rem",
                      borderRadius: "20px",
                      fontSize: "0.82rem",
                      fontWeight: isActive ? 700 : 500,
                      cursor: "pointer",
                      background: isActive ? "#4F46E5" : "#FFFFFF",
                      color: isActive ? "#FFFFFF" : "#64748B",
                      border: isActive
                        ? "1px solid #4F46E5"
                        : "1px solid #E2E8F0",
                      boxShadow: isActive
                        ? "0 2px 4px rgba(79, 70, 229, 0.2)"
                        : "0 1px 2px rgba(0, 0, 0, 0.02)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <IconComponent size={14} />
                    <span>{pill.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Controls Bar */}
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                marginBottom: "1.25rem",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1 }}>
                <SearchInput
                  placeholder={t("forms.search_all_placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div style={{ width: "130px" }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">{t("forms.all_status")}</option>
                  <option value="PUBLISHED">
                    {t("forms.status_published")}
                  </option>
                  <option value="DRAFT">{t("forms.status_draft")}</option>
                  <option value="ARCHIVED">{t("forms.status_archived")}</option>
                </Select>
              </div>
              <div style={{ width: "180px" }}>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">{t("forms.sort_recent", "Recent")}</option>
                  <option value="oldest">{t("forms.sort_oldest", "Oldest")}</option>
                  <option value="name-asc">{t("forms.sort_asc", "Title A → Z")}</option>
                  <option value="name-desc">{t("forms.sort_desc", "Title Z → A")}</option>
                </Select>
              </div>
            </div>

            {loading ? (
              <FormsSkeleton />
            ) : (
              <FormsList
                forms={filteredAllForms}
                onEdit={(form) => setEditingForm(form)}
                onDelete={(form) => setDeletingForm(form)}
                onArchive={(form) => setArchivingForm(form)}
                onUnarchive={handleFormUnarchive}
                onView={(formId) => setViewingFormId(formId)}
                onBuild={(formId, versionId) => {
                  setBuildingFormId(formId);
                  setBuildingVersionId(versionId);
                }}
              />
            )}
          </div>

          {/* Right Column: Audit Rail */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "1.25rem 1.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "#0f172a",
                }}
              >
                <span style={{ color: "#0284c7" }}>⚡</span>{" "}
                {t("forms.audit_rail", "Audit Rail")}
              </div>
              <Badge variant="success" size="sm">
                ● {t("forms.live", "Live")}
              </Badge>
            </div>

            {/* Audit Log Timeline */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    fontSize: "0.82rem",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background:
                        log.type === "published"
                          ? "#d1fae5"
                          : log.type === "submission"
                            ? "#f3e8ff"
                            : "#e0f2fe",
                      color:
                        log.type === "published"
                          ? "#059669"
                          : log.type === "submission"
                            ? "#7e22ce"
                            : "#0284c7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontWeight: 700,
                    }}
                  >
                    {log.type === "published"
                      ? "✓"
                      : log.type === "submission"
                        ? "↑"
                        : "+"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.15rem",
                      }}
                    >
                      <span style={{ fontWeight: 700, color: "#0f172a" }}>
                        {log.type === "published"
                          ? t("forms.form_published", "Form Published")
                          : log.type === "submission"
                            ? t("forms.new_submission", "New Submission")
                            : t("forms.new_form_created", "New Form Created")}
                      </span>
                      <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                        {t("forms.recently", "Recently")}
                      </span>
                    </div>
                    <div style={{ color: "#475569", marginBottom: "0.25rem" }}>
                      {log.type === "published"
                        ? t("forms.form_published_desc", { title: log.formTitle, version: log.version || 1, defaultValue: `"${log.formTitle}" published (v${log.version || 1}).` })
                        : log.type === "submission"
                          ? t("forms.new_submission_desc", { title: log.formTitle || "Form", defaultValue: `New submission in "${log.formTitle || "Form"}".` })
                          : t("forms.new_form_created_desc", { title: log.formTitle, defaultValue: `"${log.formTitle}" created.` })}
                    </div>
                    {log.submissionId ? (
                      <span
                        style={{
                          background: "#d1fae5",
                          color: "#047857",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                        }}
                      >
                        {t("forms.submission_prefix", "Submission #")}{log.submissionId}
                      </span>
                    ) : null}
                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: "0.75rem",
                        marginTop: "0.2rem",
                      }}
                    >
                      {t("forms.by_author", { author: log.author || t("forms.system", "System"), defaultValue: `By ${log.author || "System"}` })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsActivityLogModalOpen(true)}
              style={{
                width: "100%",
                padding: "0.6rem",
                background: "#FFFFFF",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#334155",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.35rem",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#059669")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#e2e8f0")
              }
            >
              {t("forms.view_full_log")}
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PUBLISHED FORMS VIEW (Image 2) */}
      {activeSubTab === "published" && (
        <div>
          {/* Controls Bar */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              marginBottom: "1.25rem",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1 }}>
              <SearchInput
                placeholder={t("forms.search_published_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div style={{ width: "130px" }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">{t("forms.all_status")}</option>
                <option value="PUBLISHED">{t("forms.status_published")}</option>
              </Select>
            </div>
            <div style={{ width: "180px" }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">{t("forms.sort_newest")}</option>
                <option value="oldest">{t("forms.sort_oldest")}</option>
                <option value="name-asc">{t("forms.sort_name_asc")}</option>
                <option value="name-desc">{t("forms.sort_name_desc")}</option>
              </Select>
            </div>
          </div>

          {loading ? (
            <FormsSkeleton />
          ) : filteredPublishedForms.length === 0 ? (
            <EmptyState
              icon={Globe}
              title={
                searchQuery
                  ? t("forms.no_matching_published")
                  : t("forms.no_published_yet")
              }
              description={
                searchQuery
                  ? t("forms.no_match_desc")
                  : t("forms.no_published_desc")
              }
            />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {filteredPublishedForms.map((form, idx) => {
                const isCopied = copiedId === form.id;
                const badgeConfig = PASTEL_ICONS[idx % PASTEL_ICONS.length];
                const PastelIcon = badgeConfig.Icon;

                return (
                  <div
                    key={form.id}
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
                      {/* Left: Icon + Title + Meta */}
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
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: "1.1rem",
                              color: "#0f172a",
                              marginBottom: "0.35rem",
                              letterSpacing: "-0.01em",
                            }}
                          >
                            <DynamicText text={form.title} />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              fontSize: "0.8rem",
                              color: "#64748b",
                            }}
                          >
                            <span>
                              v{form.current_version || 1}
                            </span>
                            <span>•</span>
                            <span>
                              {form.fields_count || 8} {t("forms.fields", "Fields")}
                            </span>
                            <span>•</span>
                            <span>
                              {t("forms.published_on", "Published:")}{" "}
                              {formatDate(form.updatedat || form.createdat)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Status Badge + Horizontal Action Buttons */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: "0.85rem",
                        }}
                      >
                        <div>
                          <Badge variant="success" size="sm">
                            {t("forms.status_published", t("forms.published_badge", "Published"))}
                          </Badge>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenForm(form.id)}
                            leftIcon={ArrowUpRight}
                            style={{ padding: "0.45rem 0.85rem" }}
                          >
                            {t("forms.open_form")}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyLink(form.id)}
                            leftIcon={isCopied ? Check : Copy}
                            style={{ padding: "0.45rem 0.85rem" }}
                          >
                            {isCopied
                              ? t("forms.copied")
                              : t("forms.copy_link")}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setQrForm(form)}
                            leftIcon={QrCode}
                            style={{ padding: "0.45rem 0.85rem" }}
                          >
                            {t("forms.qr_code")}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDetailFormId(form.id)}
                            leftIcon={Eye}
                            style={{ padding: "0.45rem 0.85rem" }}
                          >
                            {t("forms.details")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onFormCreated={handleFormCreated}
          onSuccess={handleFormCreated}
        />
      )}

      {editingForm && (
        <EditFormModal
          isOpen={!!editingForm}
          form={editingForm}
          onClose={() => setEditingForm(null)}
          onSuccess={handleFormUpdated}
        />
      )}

      {deletingForm && (
        <DeleteFormDialog
          isOpen={!!deletingForm}
          form={deletingForm}
          onClose={() => setDeletingForm(null)}
          onFormDeleted={handleFormDeleted}
          onSuccess={handleFormDeleted}
        />
      )}

      {archivingForm && (
        <ArchiveFormDialog
          isOpen={!!archivingForm}
          form={archivingForm}
          onClose={() => setArchivingForm(null)}
          onFormArchived={handleFormArchived}
          onSuccess={handleFormArchived}
        />
      )}

      {viewingFormId && (
        <FormDetailModal
          isOpen={!!viewingFormId}
          formId={viewingFormId}
          onClose={() => setViewingFormId(null)}
          onEditVersion={(form, ver) => {
            setViewingFormId(null);
            setBuildingFormId(form?.id || viewingFormId);
            setBuildingVersionId(ver?.id || ver?.version_number || null);
          }}
          onNavigateToPublished={() => setActiveSubTab("published")}
        />
      )}

      {detailFormId && (
        <PublishedFormDetailModal
          isOpen={!!detailFormId}
          formId={detailFormId}
          onClose={() => setDetailFormId(null)}
        />
      )}

      {qrForm && (
        <PublicFormQRModal
          isOpen={!!qrForm}
          form={qrForm}
          onClose={() => setQrForm(null)}
        />
      )}

      {/* Full Activity Log Modal */}
      {isActivityLogModalOpen && (
        <Modal
          isOpen={isActivityLogModalOpen}
          onClose={() => setIsActivityLogModalOpen(false)}
          title={t("forms.activity_logs_title")}
          icon={Activity}
          maxWidth="max-w-2xl"
          footer={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                {filteredActivityLogs.length !== 1
                  ? t("forms.showing_events_plural", {
                      count: filteredActivityLogs.length,
                    })
                  : t("forms.showing_events", {
                      count: filteredActivityLogs.length,
                    })}
              </span>
              <Button
                variant="outline"
                onClick={() => setIsActivityLogModalOpen(false)}
              >
                {t("forms.close")}
              </Button>
            </div>
          }
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {/* Search & Category Filters */}
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1, minWidth: "220px" }}>
                <SearchInput
                  placeholder={t("forms.search_logs_placeholder")}
                  value={activityLogSearch}
                  onChange={(e) => setActivityLogSearch(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", gap: "0.35rem" }}>
                {["ALL", "PUBLISHED", "CREATED", "SUBMISSION"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActivityLogFilter(cat)}
                    style={{
                      padding: "0.4rem 0.75rem",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      border: "1px solid #cbd5e1",
                      backgroundColor:
                        activityLogFilter === cat ? "#059669" : "#ffffff",
                      color: activityLogFilter === cat ? "#ffffff" : "#334155",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Log List */}
            <div
              style={{
                maxHeight: "420px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                paddingRight: "0.25rem",
              }}
            >
              {filteredActivityLogs.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "#64748b",
                    padding: "2rem 0",
                    fontSize: "0.9rem",
                  }}
                >
                  {t("forms.no_logs")}
                </p>
              ) : (
                filteredActivityLogs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      display: "flex",
                      gap: "0.85rem",
                      padding: "0.85rem 1rem",
                      borderRadius: "8px",
                      border: "1px solid #f1f5f9",
                      backgroundColor: "#fafafa",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "50%",
                        background:
                          log.type === "published"
                            ? "#d1fae5"
                            : log.type === "submission"
                              ? "#f3e8ff"
                              : "#e0f2fe",
                        color:
                          log.type === "published"
                            ? "#059669"
                            : log.type === "submission"
                              ? "#7e22ce"
                              : "#0284c7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontWeight: 700,
                        fontSize: "0.9rem",
                      }}
                    >
                      {log.type === "published"
                        ? "✓"
                        : log.type === "submission"
                          ? "↑"
                          : "+"}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.2rem",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            color: "#0f172a",
                            fontSize: "0.875rem",
                          }}
                        >
                          {log.title}
                        </span>
                        <span
                          style={{
                            color: "#94a3b8",
                            fontSize: "0.75rem",
                            fontFamily: "monospace",
                          }}
                        >
                          {log.timestamp
                            ? new Date(log.timestamp).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "Recent"}
                        </span>
                      </div>
                      <div
                        style={{
                          color: "#475569",
                          fontSize: "0.825rem",
                          marginBottom: "0.35rem",
                        }}
                      >
                        {log.description}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        {log.badge && (
                          <span
                            style={{
                              background: "#d1fae5",
                              color: "#047857",
                              padding: "0.15rem 0.5rem",
                              borderRadius: "4px",
                              fontSize: "0.72rem",
                              fontWeight: 600,
                            }}
                          >
                            {log.badge}
                          </span>
                        )}
                        <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                          {t("forms.by_author", { author: log.author })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
