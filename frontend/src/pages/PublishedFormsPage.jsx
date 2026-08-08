import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  RefreshCw,
  AlertCircle,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Layers,
  Clock,
  QrCode,
} from "lucide-react";
import { getForms } from "../services/formsApi";
import PublishedFormDetailModal from "../components/forms/PublishedFormDetailModal";
import PublicFormQRModal from "../components/forms/PublicFormQRModal";
import { safeCopyText } from "../utils/clipboard";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import { SearchInput, Select } from "../components/common/Input";
import EmptyState from "../components/common/EmptyState";
import { useToast } from "../components/common/Toast";
export default function PublishedFormsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [allForms, setAllForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [copiedId, setCopiedId] = useState(null);
  const [detailFormId, setDetailFormId] = useState(null);
  const [qrForm, setQrForm] = useState(null);

  // Fetch all forms
  const loadForms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getForms(0, 200);
      setAllForms(data || []);
    } catch (err) {
      console.error("Error loading forms:", err);
      setError(err.message || "Failed to load forms");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadForms();
  }, [loadForms]);

  // Filter only published forms
  const publishedForms = useMemo(() => {
    let filtered = allForms.filter(
      (f) => f.status?.toLowerCase() === "published",
    );

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.title?.toLowerCase().includes(q) ||
          f.description?.toLowerCase().includes(q),
      );
    }

    // Sort
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
  }, [allForms, searchQuery, sortBy]);
  const publishedCount = useMemo(
    () =>
      allForms.filter((f) => f.status?.toLowerCase() === "published").length,
    [allForms],
  );
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
  const getPublicUrl = (formId) =>
    `${window.location.origin}/#/public/forms/${formId}`;
  const handleOpenForm = (formId) => {
    window.location.hash = `/public/forms/${formId}`;
  };
  const handleCopyLink = (formId) => {
    const url = getPublicUrl(formId);
    safeCopyText(url).then(() => {
      setCopiedId(formId);
      toast.success("Public URL copied to clipboard");
      setTimeout(() => setCopiedId(null), 2500);
    });
  };
  return (
    <div className="published-forms-page">
      {/* Header */}
      <div className="header">
        <div className="header-title">
          <h1>{t("publishedFormsPage.publishedForms")}</h1>
          <p>{t("publishedFormsPage.viewAndManageAll")}</p>
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >
          <Badge variant="success" size="md">
            <Globe size={14} />
            {publishedCount}
            {t("publishedFormsPage.published")}
          </Badge>
          <Button
            variant="outline"
            onClick={loadForms}
            isLoading={loading}
            leftIcon={RefreshCw}
          >
            {t("publishedFormsPage.refresh")}
          </Button>
        </div>
      </div>

      {/* Controls Bar */}
      <div
        className="forms-controls-bar"
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            flex: 1,
          }}
        >
          <SearchInput
            placeholder={t("publishedFormsPage.searchPublishedForms")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div
          style={{
            width: "200px",
          }}
        >
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">
              {t("publishedFormsPage.newestFirst")}
            </option>
            <option value="oldest">
              {t("publishedFormsPage.oldestFirst")}
            </option>
            <option value="name-asc">{t("publishedFormsPage.nameAZ")}</option>
            <option value="name-desc">{t("publishedFormsPage.nameZA")}</option>
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
            onClick={loadForms}
            style={{
              marginLeft: "auto",
            }}
          >
            {t("publishedFormsPage.retry")}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && publishedForms.length === 0 && (
        <EmptyState
          icon={Globe}
          title={
            searchQuery
              ? "No Matching Published Forms"
              : "No Published Forms Yet"
          }
          description={
            searchQuery
              ? "Try adjusting your search query to find published forms."
              : "Publish a form from the Forms Portfolio to see it live here."
          }
        />
      )}

      {/* Published Forms Grid */}
      {!loading && publishedForms.length > 0 && (
        <div
          className="published-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
            gap: "1.25rem",
          }}
        >
          {publishedForms.map((form) => (
            <Card key={form.id} className="published-card" interactive={true}>
              <div
                className="published-card-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "0.75rem",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    paddingRight: "0.5rem",
                  }}
                >
                  <h3 className="published-card-title">{form.title}</h3>
                  <p
                    className="published-card-desc"
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                      marginTop: "0.25rem",
                    }}
                  >
                    {form.description || "No description provided."}
                  </p>
                </div>
                <Badge variant="success">
                  {t("publishedFormsPage.published")}
                </Badge>
              </div>

              <div
                className="published-card-meta"
                style={{
                  display: "flex",
                  gap: "1rem",
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  marginBottom: "1rem",
                  paddingBottom: "0.75rem",
                  borderBottom: "1px solid var(--rule)",
                }}
              >
                {form.current_version && (
                  <div
                    className="meta-item"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Layers size={14} />
                    <span>
                      {t("publishedFormsPage.v")}
                      {form.current_version}
                    </span>
                  </div>
                )}
                <div
                  className="meta-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Clock size={14} />
                  <span>{formatDate(form.updatedat || form.createdat)}</span>
                </div>
              </div>

              {/* Standardized 2x2 Action Button Grid */}
              <div
                className="published-card-actions"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.5rem",
                }}
              >
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={ExternalLink}
                  onClick={() => handleOpenForm(form.id)}
                >
                  {t("publishedFormsPage.openForm")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={copiedId === form.id ? Check : Copy}
                  onClick={() => handleCopyLink(form.id)}
                >
                  {copiedId === form.id ? "Copied" : "Copy Link"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={QrCode}
                  onClick={() => setQrForm(form)}
                >
                  {t("publishedFormsPage.qrCode")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={Eye}
                  onClick={() => setDetailFormId(form.id)}
                >
                  {t("publishedFormsPage.details")}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Published Form Detail Modal */}
      <PublishedFormDetailModal
        isOpen={!!detailFormId}
        onClose={() => setDetailFormId(null)}
        formId={detailFormId}
      />

      {/* QR Code Modal */}
      <PublicFormQRModal
        isOpen={!!qrForm}
        onClose={() => setQrForm(null)}
        form={qrForm}
      />
    </div>
  );
}
