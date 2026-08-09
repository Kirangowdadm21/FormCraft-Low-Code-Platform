import React, { useState, useEffect, useCallback } from "react";
import {
  GitFork,
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Edit2,
} from "lucide-react";
import { getRules, deleteRule } from "../services/rulesApi";
import {
  getForms,
  getFormVersions,
  getFieldsByVersion,
} from "../services/formsApi";
import CreateRuleModal from "../components/forms/CreateRuleModal";
import EmptyState from "../components/common/EmptyState";
import { useToast } from "../components/common/Toast";
import { RulesSkeleton } from "../components/common/PageSkeletons";
import { useTranslation } from "react-i18next";

export default function ConditionalRulesPage() {
  const toast = useToast();
  const { t } = useTranslation();
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [versions, setVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [fields, setFields] = useState([]);
  const [rules, setRules] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [error, setError] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

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

  // Load fields and rules when version changes
  useEffect(() => {
    if (!selectedVersionId) {
      setFields([]);
      setRules([]);
      return;
    }
    const loadData = async () => {
      try {
        setLoadingFields(true);
        setError(null);
        const [fieldsData, rulesData] = await Promise.all([
          getFieldsByVersion(parseInt(selectedVersionId, 10)),
          getRules(),
        ]);
        setFields(fieldsData || []);
        setRules(rulesData || []);
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoadingFields(false);
      }
    };
    loadData();
  }, [selectedVersionId]);

  const loadRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRules();
      setRules(data || []);
    } catch (err) {
      setError(err.message || "Failed to load rules");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm(t("rules.confirm_delete"))) return;
    try {
      await deleteRule(ruleId);
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      toast.success("Rule deleted successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to delete rule");
    }
  };

  const handleRuleCreated = (rule, isUpdate) => {
    if (isUpdate) {
      setRules((prev) => prev.map((r) => (r.id === rule.id ? rule : r)));
      toast.success("Rule updated successfully.");
    } else {
      setRules((prev) => [rule, ...prev]);
      toast.success("Rule created successfully.");
    }
  };

  const getFieldLabel = (fieldId) => {
    const field = fields.find((f) => f.id === fieldId);
    return field ? field.label : `Field #${fieldId}`;
  };

  // Filter rules relevant to selected version's fields
  const fieldIds = fields.map((f) => f.id);
  const filteredRules = selectedVersionId
    ? rules.filter(
        (r) =>
          fieldIds.includes(r.trigger_field) ||
          fieldIds.includes(r.targeted_field),
      )
    : rules;

  return (
    <div
      style={{
        padding: "2rem 2.5rem",
        maxWidth: "1400px",
        margin: "0 auto",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <div
        className="page-header-row"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
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
            {t("rules.title")}
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#64748b",
              marginTop: "0.35rem",
              margin: 0,
            }}
          >
            {t("rules.subtitle")}
          </p>
        </div>
        <div className="page-header-actions" style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            onClick={loadRules}
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
            <span>{t("rules.refresh")}</span>
          </button>
          <button
            onClick={() => {
              setEditingRule(null);
              setIsCreateModalOpen(true);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1.15rem",
              backgroundColor: "#059669",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#ffffff",
              cursor: "pointer",
              boxShadow: "0 1px 3px 0 rgba(5, 150, 105, 0.3)",
              transition: "all 0.15s ease",
            }}
          >
            <Plus size={16} />
            <span>{t("rules.create_rule")}</span>
          </button>
        </div>
      </div>

      {/* Form & Version Selectors Row */}
      <div
        className="forms-controls-bar"
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
              {t("rules.form_label")}
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
                <option value="">{t("rules.select_form")}</option>
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
                {t("conditionalRulesPage.text")}
              </div>
            </div>
          </div>

          {/* VERSION Dropdown */}
          <div style={{ flex: "0 1 240px", minWidth: "200px" }}>
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
              {t("rules.version_label")}
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
                <option value="">{t("rules.select_version")}</option>
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {t("conditionalRulesPage.v")}
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
                {t("conditionalRulesPage.text")}
              </div>
            </div>
          </div>

          {/* Fields Loaded Badge */}
          <div
            style={{
              marginLeft: "auto",
              alignSelf: "center",
              paddingTop: "1.25rem",
            }}
          >
            {fields.length > 0 && (
              <span
                style={{
                  fontSize: "0.825rem",
                  color: "#64748b",
                  fontWeight: 500,
                }}
              >
                {t("rules.fields_loaded", { count: fields.length })}
              </span>
            )}
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
            onClick={loadRules}
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
            {t("rules.retry")}
          </button>
        </div>
      )}

      {/* Loading State */}
      {loadingFields && <RulesSkeleton />}

      {/* Empty State */}
      {!loadingFields && filteredRules.length === 0 && (
        <EmptyState
          icon={GitFork}
          title={t("rules.no_rules")}
          description={
            selectedVersionId
              ? t("rules.no_rules_version")
              : t("rules.no_rules_select")
          }
        />
      )}

      {/* Rules Cards Grid */}
      {!loadingFields && filteredRules.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
            gap: "1.25rem",
          }}
        >
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "0.75rem",
                padding: "1.25rem 1.5rem",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.04)",
                transition: "all 0.15s ease",
              }}
            >
              {/* Card Top Row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.25rem",
                }}
              >
                {/* Rule Tag Badge */}
                <span
                  style={{
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.375rem",
                    padding: "0.2rem 0.6rem",
                    fontSize: "0.75rem",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: "#475569",
                    letterSpacing: "0.04em",
                  }}
                >
                  {t("conditionalRulesPage.rule")}

                  {rule.id}
                </span>

                {/* Edit / Delete Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <button
                    onClick={() => {
                      setEditingRule(rule);
                      setIsCreateModalOpen(true);
                    }}
                    title={t("rules.edit_rule")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      cursor: "pointer",
                      padding: "0.35rem",
                      borderRadius: "0.375rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "color 0.15s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#334155")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#94a3b8")
                    }
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    title={t("rules.delete_rule")}
                    style={{
                      backgroundColor: "#dc2626",
                      border: "none",
                      color: "#ffffff",
                      cursor: "pointer",
                      padding: "0.45rem",
                      borderRadius: "0.375rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 1px 2px 0 rgba(220, 38, 38, 0.2)",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#b91c1c")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#dc2626")
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Card Body - Rule Logic */}
              <div
                style={{
                  fontSize: "0.9rem",
                  lineHeight: "1.7",
                  color: "#1e293b",
                }}
              >
                {/* IF clause */}
                <div
                  style={{
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      color: "#0284c7",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                    }}
                  >
                    {t("conditionalRulesPage.if")}
                  </span>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>
                    {getFieldLabel(rule.trigger_field)}
                  </span>
                  <span style={{ color: "#0284c7", fontWeight: 700 }}>
                    {rule.operator}
                  </span>
                  {rule.comparison && (
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>
                      {t("conditionalRulesPage.text")}
                      {rule.comparison}
                      {t("conditionalRulesPage.text")}
                    </span>
                  )}
                </div>

                {/* THEN clause */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      color: "#0284c7",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                    }}
                  >
                    {t("conditionalRulesPage.then")}
                  </span>
                  <span
                    style={{
                      backgroundColor:
                        rule.action === "show"
                          ? "#dcfce7"
                          : rule.action === "hide"
                            ? "#fee2e2"
                            : "#fef3c7",
                      color:
                        rule.action === "show"
                          ? "#15803d"
                          : rule.action === "hide"
                            ? "#b91c1c"
                            : "#b45309",
                      fontWeight: 800,
                      fontSize: "0.75rem",
                      padding: "0.15rem 0.65rem",
                      borderRadius: "9999px",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {rule.action}
                  </span>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>
                    {t("conditionalRulesPage.text")}
                    {getFieldLabel(rule.targeted_field)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Rule Modal */}
      <CreateRuleModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingRule(null);
        }}
        onRuleCreated={handleRuleCreated}
        existingRule={editingRule}
        fields={fields}
      />
    </div>
  );
}
