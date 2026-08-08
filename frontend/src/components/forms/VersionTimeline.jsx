import { useTranslation } from "react-i18next";
import React, { useState, useMemo } from "react";
import {
  Eye,
  Edit3,
  Calendar,
  Clock,
  Layers,
  CheckCircle2,
  Zap,
  AlertTriangle,
  GitBranch,
  Search,
  Filter,
  GitCompare,
  Send,
  RefreshCw,
  XCircle,
  Archive,
  BarChart2,
  Check,
  ArrowDown,
  ArrowUp,
  Info,
} from "lucide-react";
import VersionDetailModal from "./VersionDetailModal";
import VersionCompareModal from "./VersionCompareModal";
import PublishConfirmModal from "./PublishConfirmModal";
import { publishForm } from "../../services/formsApi";
export default function VersionTimeline({
  versions = [],
  currentVersion,
  onEditVersion,
  formId,
  formTitle,
  formStatus,
  onVersionPublished,
  isLoading = false,
  error = null,
  onRetry,
  onNavigateToPublished,
}) {
  const { t } = useTranslation();
  const [viewingVersion, setViewingVersion] = useState(null);
  const [comparingVersion, setComparingVersion] = useState(null);
  const [publishingVersionObj, setPublishingVersionObj] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All"); // All, Published, Draft, Archived, Active
  const [sortOrder, setSortOrder] = useState("Newest"); // Newest, Oldest

  // Toast Notification state
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({
      message,
      type,
    });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return dateStr;
    }
  };

  // Feature 7: Statistics calculation
  const stats = useMemo(() => {
    const total = versions.length;
    const published = versions.filter((v) => v.ispublished).length;
    const draft = versions.filter((v) => !v.ispublished).length;
    const archived = formStatus === "archived" ? total : 0;
    const activeVerObj = versions.find(
      (v) =>
        (currentVersion != null && Number(v.version_number) === Number(currentVersion)) ||
        v.ispublished
    );
    const active = activeVerObj
      ? `v${activeVerObj.version_number}`
      : currentVersion
      ? `v${currentVersion}`
      : "None";
    return {
      total,
      published,
      draft,
      archived,
      active,
    };
  }, [versions, formStatus, currentVersion]);

  // Feature 5 & 6: Search, Filter, and Sort logic
  const filteredVersions = useMemo(() => {
    let result = [...versions];

    // Search filtering (Version Number, Status, Date, Field Count)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((ver) => {
        const verNumStr = `v${ver.version_number} version ${ver.version_number}`;
        const statusStr = ver.ispublished ? "published" : "draft";
        const isActiveStr =
          (currentVersion != null && Number(ver.version_number) === Number(currentVersion)) || ver.ispublished
            ? "active"
            : "";
        const createdDateStr = formatDate(ver.createdat).toLowerCase();
        const updatedDateStr = formatDate(ver.updatedat).toLowerCase();
        const fieldCountStr = `${ver.fields ? ver.fields.length : 0} fields`;
        return (
          verNumStr.includes(q) ||
          statusStr.includes(q) ||
          isActiveStr.includes(q) ||
          createdDateStr.includes(q) ||
          updatedDateStr.includes(q) ||
          fieldCountStr.includes(q)
        );
      });
    }

    // Status filter chips
    if (activeFilter === "Published") {
      result = result.filter((v) => v.ispublished);
    } else if (activeFilter === "Draft") {
      result = result.filter((v) => !v.ispublished);
    } else if (activeFilter === "Active") {
      result = result.filter(
        (v) =>
          (currentVersion != null && Number(v.version_number) === Number(currentVersion)) ||
          v.ispublished
      );
    } else if (activeFilter === "Archived") {
      result = formStatus === "archived" ? result : [];
    }

    // Sort order (Newest / Oldest)
    result.sort((a, b) => {
      if (sortOrder === "Oldest") {
        return a.version_number - b.version_number;
      }
      return b.version_number - a.version_number;
    });
    return result;
  }, [
    versions,
    searchQuery,
    activeFilter,
    sortOrder,
    currentVersion,
    formStatus,
  ]);

  // Handle Filter Chip selection
  const handleFilterClick = (filterName) => {
    setActiveFilter(filterName);
    showToast(`Filter Applied: ${filterName}`, "info");
  };

  // Handle Sort Change
  const handleSortChange = (newSort) => {
    setSortOrder(newSort);
    showToast(`Sorted by ${newSort}`, "info");
  };

  // Feature 1: Publish action trigger
  const handleConfirmPublish = async (versionNumber) => {
    if (!formId) return;
    setIsPublishing(true);
    try {
      await publishForm(formId, versionNumber);
      showToast("Version Published Successfully", "success");
      if (onVersionPublished) {
        onVersionPublished(versionNumber);
      }
    } catch (err) {
      showToast(err.message || "Failed to publish version", "error");
      throw err;
    } finally {
      setIsPublishing(false);
    }
  };
  const hasActiveVersion =
    currentVersion != null &&
    versions.some((v) => v.version_number === currentVersion);
  return (
    <div className="version-timeline-container">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`notification-toast toast-${toast.type}`}
          role="status"
          aria-live="polite"
        >
          {toast.type === "success" && <CheckCircle2 size={16} />}
          {toast.type === "info" && <Info size={16} />}
          {toast.type === "error" && <XCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Feature 7: Statistics Cards Bar */}
      <div className="version-stats-grid">
        <div className="version-stat-card">
          <div className="stat-card-icon icon-purple">
            <Layers size={18} />
          </div>
          <div className="stat-card-content">
            <span className="stat-card-label">
              {t("versionTimeline.totalVersions")}
            </span>
            <span className="stat-card-value">{stats.total}</span>
          </div>
        </div>

        <div className="version-stat-card">
          <div className="stat-card-icon icon-green">
            <CheckCircle2 size={18} />
          </div>
          <div className="stat-card-content">
            <span className="stat-card-label">
              {t("versionTimeline.publishedVersions")}
            </span>
            <span className="stat-card-value">{stats.published}</span>
          </div>
        </div>

        <div className="version-stat-card">
          <div className="stat-card-icon icon-amber">
            <GitBranch size={18} />
          </div>
          <div className="stat-card-content">
            <span className="stat-card-label">
              {t("versionTimeline.draftVersions")}
            </span>
            <span className="stat-card-value">{stats.draft}</span>
          </div>
        </div>

        <div className="version-stat-card">
          <div className="stat-card-icon icon-gray">
            <Archive size={18} />
          </div>
          <div className="stat-card-content">
            <span className="stat-card-label">
              {t("versionTimeline.archivedVersions")}
            </span>
            <span className="stat-card-value">{stats.archived}</span>
          </div>
        </div>

        <div className="version-stat-card stat-card-active-highlight">
          <div className="stat-card-icon icon-emerald">
            <Zap size={18} />
          </div>
          <div className="stat-card-content">
            <span className="stat-card-label">
              {t("versionTimeline.currentActiveVersion")}
            </span>
            <span className="stat-card-value">{stats.active}</span>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="version-timeline-header">
        <div className="version-timeline-title-row">
          <GitBranch size={20} color="var(--primary)" />
          <h4 className="version-timeline-title">
            {t("versionTimeline.versionHistory")}

            <span className="version-timeline-count">
              {filteredVersions.length}
            </span>
          </h4>
        </div>

        {/* Active Version Indicator */}
        {hasActiveVersion ? (
          <div className="version-active-indicator">
            <Zap size={14} />
            <span>
              {t("versionTimeline.activeV")}
              {currentVersion}
            </span>
          </div>
        ) : (
          <div className="version-no-active-indicator">
            <AlertTriangle size={14} />
            <span>{t("versionTimeline.noActiveVersion")}</span>
          </div>
        )}
      </div>

      {/* Feature 5 & 6: Search Bar & Filter Chips */}
      <div className="version-filter-bar">
        <div className="version-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="version-search-input"
            placeholder={t("versionTimeline.searchByVersion")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t("versionTimeline.searchVersionHistory")}
          />

          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchQuery("")}
              aria-label={t("versionTimeline.clearSearchQuery")}
            >
              <XCircle size={14} />
            </button>
          )}
        </div>

        <div className="version-filter-chips">
          {["All", "Published", "Draft", "Active", "Archived"].map(
            (filterName) => (
              <button
                key={filterName}
                className={`filter-chip ${activeFilter === filterName ? "chip-active" : ""}`}
                onClick={() => handleFilterClick(filterName)}
                aria-pressed={activeFilter === filterName}
              >
                {filterName}
              </button>
            ),
          )}
        </div>

        <div className="version-sort-control">
          <button
            className="sort-toggle-btn"
            onClick={() =>
              handleSortChange(sortOrder === "Newest" ? "Oldest" : "Newest")
            }
            title={`Toggle order (current: ${sortOrder})`}
          >
            {sortOrder === "Newest" ? (
              <ArrowDown size={14} />
            ) : (
              <ArrowUp size={14} />
            )}
            <span>{sortOrder}</span>
          </button>
        </div>
      </div>

      {/* Feature 11: Error handling state with retry */}
      {error && (
        <div className="version-error-box">
          <AlertTriangle size={20} />
          <div className="error-box-content">
            <strong>{t("versionTimeline.unableToLoadVersion")}</strong>
            <p>{error}</p>
          </div>
          {onRetry && (
            <button className="btn-secondary btn-sm" onClick={onRetry}>
              <RefreshCw size={14} />
              {t("versionTimeline.retry")}
            </button>
          )}
        </div>
      )}

      {/* Feature 10: Skeleton Loading State */}
      {isLoading && (
        <div className="version-skeleton-list">
          {[1, 2, 3].map((n) => (
            <div className="version-skeleton-card" key={n}>
              <div className="skeleton-line skeleton-title" />
              <div className="skeleton-line skeleton-meta" />
              <div className="skeleton-line skeleton-buttons" />
            </div>
          ))}
        </div>
      )}

      {/* Feature 8: Version Timeline Rail */}
      {!isLoading && !error && filteredVersions.length === 0 ? (
        <div className="version-timeline-empty">
          <Layers
            size={32}
            style={{
              opacity: 0.25,
            }}
          />
          <p>
            {searchQuery || activeFilter !== "All"
              ? "No versions match your search or filter criteria."
              : "No versions available for this form."}
          </p>
          {(searchQuery || activeFilter !== "All") && (
            <button
              className="btn-secondary btn-sm"
              style={{
                marginTop: "0.75rem",
              }}
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("All");
              }}
            >
              {t("versionTimeline.resetFilters")}
            </button>
          )}
        </div>
      ) : (
        !isLoading &&
        !error && (
          <div className="version-timeline-rail">
            <div className="timeline-direction-badge">
              <span>
                {sortOrder === "Newest"
                  ? "Newest ↓ Older ↓ Oldest"
                  : "Oldest ↑ Newer ↑ Newest"}
              </span>
            </div>

            {filteredVersions.map((ver, idx) => {
              const isActive =
                (currentVersion != null && Number(ver.version_number) === Number(currentVersion)) ||
                ver.ispublished;
              const isFirst = idx === 0;
              const isLast = idx === filteredVersions.length - 1;
              const fieldCount = ver.fields ? ver.fields.length : 0;
              return (
                <div
                  className={`version-timeline-card ${isActive ? "version-active" : ""} ${isFirst ? "version-newest" : ""}`}
                  key={ver.id || ver.version_number}
                >
                  {/* Timeline Dot & Connector Line */}
                  <div className="version-timeline-dot-col">
                    <div
                      className={`version-timeline-dot ${isActive ? "dot-active" : ver.ispublished ? "dot-published" : "dot-draft"}`}
                    />

                    {!isLast && <div className="version-timeline-line" />}
                  </div>

                  {/* Card Content */}
                  <div
                    className={`version-timeline-card-body ${isActive ? "card-active" : ""}`}
                  >
                    {/* Top Row: Version Number + Status Badges */}
                    <div className="version-card-top-row">
                      <div className="version-card-num-group">
                        <span className="version-card-number">
                          {t("versionTimeline.version")}
                          {ver.version_number}
                        </span>
                      </div>

                      <div className="version-card-badges">
                        {/* Feature 2: Active Version Badge */}
                        {isActive ? (
                          <span className="badge badge-active-green badge-sm">
                            <Check size={11} />
                            {t("versionTimeline.activeVersion")}
                          </span>
                        ) : ver.ispublished ? (
                          <span className="badge badge-success badge-sm">
                            <CheckCircle2 size={11} />
                            {t("versionTimeline.published")}
                          </span>
                        ) : (
                          <span className="badge badge-draft badge-sm">
                            {t("versionTimeline.draft")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Meta Row: Dates + Field Count */}
                    <div className="version-card-meta-row">
                      <span className="version-card-meta-item">
                        <Calendar size={13} />
                        {formatDate(ver.createdat)}
                      </span>
                      <span className="version-card-meta-item">
                        <Clock size={13} />
                        {formatDate(ver.updatedat)}
                      </span>
                      <span className="version-card-meta-item">
                        <Layers size={13} />
                        {fieldCount}
                        {t("versionTimeline.field")}
                        {fieldCount !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Action Buttons: View, Edit, Compare, Publish */}
                    <div className="version-card-actions-row">
                      <button
                        className="version-card-view-btn"
                        onClick={() => setViewingVersion(ver)}
                        title={`View details for Version ${ver.version_number}`}
                        aria-label={`View Version ${ver.version_number}`}
                      >
                        <Eye size={14} />
                        <span>{t("versionTimeline.view")}</span>
                      </button>

                      {onEditVersion && (
                        <button
                          className="version-card-edit-btn"
                          onClick={() => onEditVersion(ver)}
                          title={`Edit Version ${ver.version_number} in Form Builder`}
                          aria-label={`Edit Version ${ver.version_number}`}
                        >
                          <Edit3 size={14} />
                          <span>{t("versionTimeline.edit")}</span>
                        </button>
                      )}

                      {/* Feature 4: Compare Button */}
                      <button
                        className="version-card-compare-btn"
                        onClick={() => setComparingVersion(ver)}
                        title={`Compare Version ${ver.version_number} with another version`}
                        aria-label={`Compare Version ${ver.version_number}`}
                      >
                        <GitCompare size={14} />
                        <span>{t("versionTimeline.compare")}</span>
                      </button>

                      {/* Feature 1 & Feature 3: Publish Button / Already Active Disabled State */}
                      {isActive ? (
                        <button
                          className="version-card-publish-btn btn-disabled-active"
                          disabled
                          title={t("versionTimeline.thisVersionIsAlready")}
                          aria-disabled="true"
                        >
                          <Check size={14} />
                          <span>{t("versionTimeline.alreadyActive")}</span>
                        </button>
                      ) : (
                        <button
                          className="version-card-publish-btn"
                          onClick={() => setPublishingVersionObj(ver)}
                          title={`Publish Version ${ver.version_number}`}
                          aria-label={`Publish Version ${ver.version_number}`}
                        >
                          <Send size={14} />
                          <span>{t("versionTimeline.publish")}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Version Detail Modal */}
      <VersionDetailModal
        isOpen={!!viewingVersion}
        onClose={() => setViewingVersion(null)}
        version={viewingVersion}
        currentVersion={currentVersion}
      />

      {/* Feature 4: Version Comparison Modal */}
      <VersionCompareModal
        isOpen={!!comparingVersion}
        onClose={() => setComparingVersion(null)}
        currentVersionObj={comparingVersion}
        allVersions={versions}
        onToast={showToast}
      />

      {/* Feature 1: Publish Confirmation Modal */}
      <PublishConfirmModal
        isOpen={!!publishingVersionObj}
        onClose={() => setPublishingVersionObj(null)}
        onConfirm={handleConfirmPublish}
        version={publishingVersionObj}
        isPublishing={isPublishing}
        formTitle={formTitle}
        formId={formId}
        onNavigateToPublished={onNavigateToPublished}
      />
    </div>
  );
}
