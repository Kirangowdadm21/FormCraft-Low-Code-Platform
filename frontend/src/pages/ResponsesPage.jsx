import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FileText,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  getSubmissions,
  getResponses,
  deleteResponse,
} from "../services/responsesApi";
import {
  getForms,
  getFormVersions,
  getFieldsByVersion,
} from "../services/formsApi";
import EmptyState from "../components/common/EmptyState";
import { useToast } from "../components/common/Toast";
import { ResponsesSkeleton } from "../components/common/PageSkeletons";
import { useTranslation } from "react-i18next";

export default function ResponsesPage() {
  const toast = useToast();
  const { t } = useTranslation();
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [versions, setVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [versionFields, setVersionFields] = useState([]);

  const [submissions, setSubmissions] = useState([]);
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [responses, setResponses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Load forms on mount
  useEffect(() => {
    const loadForms = async () => {
      try {
        const data = await getForms(0, 200);
        setForms(data || []);
        if (data && data.length > 0 && !selectedFormId) {
          setSelectedFormId(String(data[0].id));
        }
      } catch (err) {
        console.error("Error loading forms:", err);
      }
    };
    loadForms();
  }, []);

  // Load versions when form changes
  useEffect(() => {
    if (!selectedFormId) {
      setVersions([]);
      setSelectedVersionId("");
      return;
    }
    const loadVersions = async () => {
      try {
        const vers = await getFormVersions(parseInt(selectedFormId, 10));
        setVersions(vers || []);
        if (vers && vers.length > 0) {
          const latest = [...vers].sort(
            (a, b) => b.version_number - a.version_number,
          )[0];
          setSelectedVersionId(String(latest.id));
        } else {
          setSelectedVersionId("");
        }
      } catch (err) {
        console.error("Error loading versions:", err);
        setVersions([]);
      }
    };
    loadVersions();
  }, [selectedFormId]);

  // Load field metadata for selected version
  useEffect(() => {
    if (!selectedVersionId) {
      setVersionFields([]);
      return;
    }
    const loadFields = async () => {
      try {
        const fieldsData = await getFieldsByVersion(
          parseInt(selectedVersionId, 10),
        );
        setVersionFields(fieldsData || []);
      } catch (err) {
        setVersionFields([]);
      }
    };
    loadFields();
  }, [selectedVersionId]);

  // Map of field ID to human-readable label
  const fieldMap = useMemo(() => {
    const map = {};
    if (versionFields && versionFields.length > 0) {
      versionFields.forEach((f) => {
        const label = f.label || f.field_name;
        if (label) {
          map[f.id] = label;
          map[String(f.id)] = label;
        }
      });
    }
    if (selectedVersionId && versions && versions.length > 0) {
      const currentVer = versions.find(
        (v) => String(v.id) === String(selectedVersionId),
      );
      if (currentVer && currentVer.fields) {
        currentVer.fields.forEach((f) => {
          const label = f.label || f.field_name;
          if (label && !map[f.id]) {
            map[f.id] = label;
            map[String(f.id)] = label;
          }
        });
      }
    }
    return map;
  }, [versionFields, selectedVersionId, versions]);

  // Fetch responses for a given submission
  const fetchResponsesForSubmission = async (submissionId) => {
    try {
      setLoadingResponses(true);
      const data = await getResponses(submissionId);
      setResponses(data || []);
    } catch (err) {
      setError(err.message || "Failed to load responses");
    } finally {
      setLoadingResponses(false);
    }
  };

  // Load submissions when version changes
  const loadSubmissions = useCallback(async () => {
    if (!selectedVersionId) {
      setSubmissions([]);
      setExpandedSubmission(null);
      setResponses([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getSubmissions(parseInt(selectedVersionId, 10));
      setSubmissions(data || []);
      if (data && data.length > 0) {
        // Auto-expand first submission
        const firstSubId = data[0].id;
        setExpandedSubmission(firstSubId);
        fetchResponsesForSubmission(firstSubId);
      } else {
        setExpandedSubmission(null);
        setResponses([]);
      }
    } catch (err) {
      setError(err.message || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, [selectedVersionId]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // Expand/collapse submission
  const handleToggleSubmission = async (submissionId) => {
    if (expandedSubmission === submissionId) {
      setExpandedSubmission(null);
      setResponses([]);
      return;
    }
    setExpandedSubmission(submissionId);
    await fetchResponsesForSubmission(submissionId);
  };

  const handleDeleteResponse = async (responseId) => {
    if (!window.confirm("Delete this response value permanently?")) return;
    try {
      await deleteResponse(responseId);
      setResponses((prev) => prev.filter((r) => r.id !== responseId));
      toast.success("Response deleted successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to delete response");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const filteredSubmissions = useMemo(() => {
    if (!searchQuery) return submissions;
    const q = searchQuery.toLowerCase();
    return submissions.filter(
      (s) =>
        String(s.id).includes(q) ||
        (s.submitted_at && s.submitted_at.toLowerCase().includes(q)),
    );
  }, [submissions, searchQuery]);

  return (
    <div className="responses-page-container">
      {/* Page Header */}
      <div className="responses-page-header">
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            {t("submissions.title")}
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#64748b",
              marginTop: "0.35rem",
              margin: 0,
            }}
          >
            {t("submissions.subtitle")}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            onClick={loadSubmissions}
            disabled={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#334155",
              cursor: "pointer",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              transition: "all 0.15s ease",
            }}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span>{t("submissions.refresh")}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Controls Row */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "0.75rem",
          padding: "1.25rem 1.5rem",
          marginBottom: "2rem",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.02)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* FORM Dropdown */}
          <div style={{ flex: "1 1 260px", minWidth: "220px" }}>
            <label
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#64748b",
                display: "block",
                marginBottom: "0.4rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {t("submissions.form_label")}
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={selectedFormId}
                onChange={(e) => setSelectedFormId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 1rem",
                  backgroundColor: "#ffffff",
                  border: "2px solid #059669",
                  borderRadius: "0.5rem",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#0f172a",
                  outline: "none",
                  cursor: "pointer",
                  appearance: "none",
                }}
              >
                <option value="">{t("submissions.select_form")}</option>
                {forms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
              </select>
              <div
                style={{
                  position: "absolute",
                  right: "0.85rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: "#059669",
                  fontSize: "0.75rem",
                }}
              >
                {t("responsesPage.text")}
              </div>
            </div>
          </div>

          {/* VERSION Dropdown */}
          <div style={{ flex: "0 1 220px", minWidth: "180px" }}>
            <label
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#64748b",
                display: "block",
                marginBottom: "0.4rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {t("submissions.version_label")}
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={selectedVersionId}
                onChange={(e) => setSelectedVersionId(e.target.value)}
                disabled={!selectedFormId}
                style={{
                  width: "100%",
                  padding: "0.65rem 1rem",
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0.5rem",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  color: "#334155",
                  outline: "none",
                  cursor: selectedFormId ? "pointer" : "not-allowed",
                  appearance: "none",
                }}
              >
                <option value="">{t("submissions.select_version")}</option>
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {t("responsesPage.v")}
                    {v.version_number}
                    {v.ispublished
                      ? ` ${t("submissions.published_version")}`
                      : ""}
                  </option>
                ))}
              </select>
              <div
                style={{
                  position: "absolute",
                  right: "0.85rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: "#64748b",
                  fontSize: "0.75rem",
                }}
              >
                {t("responsesPage.text")}
              </div>
            </div>
          </div>

          {/* SEARCH SUBMISSIONS */}
          <div style={{ flex: "1 1 320px", minWidth: "260px" }}>
            <label
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#64748b",
                display: "block",
                marginBottom: "0.4rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {t("submissions.search_label")}
            </label>
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "0.85rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#0284c7",
                }}
              />
              <input
                type="text"
                placeholder={t("submissions.search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 1rem 0.65rem 2.5rem",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  color: "#0f172a",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Count Badge */}
          <div
            className="responses-count-badge"
            style={{
              marginLeft: "auto",
              alignSelf: "center",
              paddingTop: "1.25rem",
            }}
          >
            <span
              style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 500 }}
            >
              {filteredSubmissions.length !== 1
                ? t("submissions.submission_count_other", {
                    count: filteredSubmissions.length,
                  })
                : t("submissions.submission_count_one", {
                    count: filteredSubmissions.length,
                  })}
            </span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "0.5rem",
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "0.875rem",
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
          <button
            onClick={loadSubmissions}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              color: "#dc2626",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {t("responsesPage.retry")}
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && <ResponsesSkeleton />}

      {/* Empty State */}
      {!loading && filteredSubmissions.length === 0 && (
        <EmptyState
          icon={FileText}
          title={t("submissions.no_submissions")}
          description={
            selectedVersionId
              ? t("submissions.no_submissions_version")
              : t("submissions.no_submissions_select")
          }
        />
      )}

      {/* Submissions Collapsible Cards List */}
      {!loading && filteredSubmissions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filteredSubmissions.map((sub) => {
            const isExpanded = expandedSubmission === sub.id;
            return (
              <div
                key={sub.id}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.03)",
                }}
              >
                {/* Submission Header Row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem 1.5rem",
                    backgroundColor: isExpanded ? "#fafafa" : "#ffffff",
                    cursor: "pointer",
                    userSelect: "none",
                    borderBottom: isExpanded ? "1px solid #e2e8f0" : "none",
                  }}
                  onClick={() => handleToggleSubmission(sub.id)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1.25rem",
                    }}
                  >
                    {/* Badge */}
                    <span
                      style={{
                        backgroundColor: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.375rem",
                        padding: "0.25rem 0.65rem",
                        fontSize: "0.78rem",
                        fontFamily: "monospace",
                        fontWeight: 700,
                        color: "#475569",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {t("responsesPage.sub")}

                      {sub.id}
                    </span>
                    {/* Timestamp */}
                    <span
                      style={{
                        color: "#64748b",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    >
                      {formatDate(sub.submitted_at)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.85rem",
                      color: "#94a3b8",
                    }}
                  >
                    <SlidersHorizontal
                      size={16}
                      style={{ transform: "rotate(90deg)", opacity: 0.6 }}
                    />
                    {isExpanded ? (
                      <ChevronUp size={18} color="#64748b" />
                    ) : (
                      <ChevronDown size={18} color="#64748b" />
                    )}
                  </div>
                </div>

                {/* Expanded Response Details Table */}
                {isExpanded && (
                  <div
                    style={{
                      padding: "0 1.5rem 1.25rem 1.5rem",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    {loadingResponses ? (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "2rem 0",
                          color: "#64748b",
                        }}
                      >
                        <Loader2
                          size={24}
                          className="animate-spin"
                          style={{ color: "#059669" }}
                        />
                        <span
                          style={{ marginLeft: "0.5rem", fontSize: "0.9rem" }}
                        >
                          {t("submissions.loading_responses")}
                        </span>
                      </div>
                    ) : responses.length === 0 ? (
                      <div
                        style={{
                          padding: "1.5rem 0",
                          textAlign: "center",
                          color: "#64748b",
                          fontSize: "0.875rem",
                        }}
                      >
                        {t("submissions.no_field_responses")}
                      </div>
                    ) : (
                      <div>
                        {/* Table Header */}
                        <div className="responses-grid-header">
                          <span>{t("submissions.id_col")}</span>
                          <span>{t("submissions.field_col")}</span>
                          <span>{t("submissions.value_col")}</span>
                          <span style={{ textAlign: "center" }}></span>
                        </div>

                        {/* Table Rows */}
                        {responses.map((resp) => (
                          <div key={resp.id} className="responses-grid-row">
                            {/* Response ID */}
                            <span className="responses-row-id">
                              {t("responsesPage.r")}
                              {resp.id}
                            </span>

                            {/* Field Name */}
                            <span className="responses-row-field-text">
                              {fieldMap[resp.field_id] ||
                                fieldMap[String(resp.field_id)] ||
                                `Field #${resp.field_id}`}
                            </span>

                            {/* Response Value */}
                            <span className="responses-row-value-text">
                              {resp.value !== null &&
                              resp.value !== undefined &&
                              resp.value !== "" ? (
                                String(resp.value)
                              ) : (
                                <em className="responses-empty-value">
                                  {t("submissions.empty_value")}
                                </em>
                              )}
                            </span>

                            {/* Action Trash Button */}
                            <div className="responses-row-actions">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteResponse(resp.id);
                                }}
                                title={t("submissions.delete_response")}
                                style={{
                                  backgroundColor: "#dc2626",
                                  border: "none",
                                  color: "#ffffff",
                                  cursor: "pointer",
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "6px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  boxShadow:
                                    "0 1px 2px 0 rgba(220, 38, 38, 0.2)",
                                  transition: "background-color 0.15s ease",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#b91c1c")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#dc2626")
                                }
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
