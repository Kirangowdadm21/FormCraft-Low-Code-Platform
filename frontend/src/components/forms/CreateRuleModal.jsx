import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { X, Loader2, GitFork, AlertCircle } from "lucide-react";
import { createRule, updateRule } from "../../services/rulesApi";
const OPERATORS = [
  {
    value: "equals",
    label: "Equals",
  },
  {
    value: "not_equals",
    label: "Not Equals",
  },
  {
    value: "contains",
    label: "Contains",
  },
  {
    value: "greater_than",
    label: "Greater Than",
  },
  {
    value: "less_than",
    label: "Less Than",
  },
  {
    value: "is_empty",
    label: "Is Empty",
  },
  {
    value: "is_not_empty",
    label: "Is Not Empty",
  },
];
const ACTIONS = [
  {
    value: "show",
    label: "Show",
  },
  {
    value: "hide",
    label: "Hide",
  },
  {
    value: "require",
    label: "Require",
  },
];
export default function CreateRuleModal({
  isOpen,
  onClose,
  onRuleCreated,
  existingRule,
  fields,
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    trigger_field: "",
    operator: "equals",
    comparison: "",
    targeted_field: "",
    action: "show",
    logical_group: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const isEditMode = !!existingRule;
  useEffect(() => {
    if (existingRule) {
      setFormData({
        trigger_field: existingRule.trigger_field || "",
        operator: existingRule.operator || "equals",
        comparison: existingRule.comparison || "",
        targeted_field: existingRule.targeted_field || "",
        action: existingRule.action || "show",
        logical_group: existingRule.logical_group || "",
      });
    } else {
      setFormData({
        trigger_field: "",
        operator: "equals",
        comparison: "",
        targeted_field: "",
        action: "show",
        logical_group: "",
      });
    }
    setError(null);
  }, [existingRule, isOpen]);
  if (!isOpen) return null;
  const isComparisonDisabled =
    formData.operator === "is_empty" || formData.operator === "is_not_empty";
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.trigger_field) {
      setError("Please select a trigger field.");
      return;
    }
    if (!formData.targeted_field) {
      setError("Please select a target field.");
      return;
    }
    if (!isComparisonDisabled && !formData.comparison.trim()) {
      setError("Please enter a comparison value.");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        trigger_field: parseInt(formData.trigger_field, 10),
        operator: formData.operator,
        comparison: isComparisonDisabled ? null : formData.comparison,
        targeted_field: parseInt(formData.targeted_field, 10),
        action: formData.action,
        logical_group: formData.logical_group || null,
      };
      if (isEditMode) {
        const updated = await updateRule(existingRule.id, payload);
        onRuleCreated(updated, true);
      } else {
        const created = await createRule(payload);
        onRuleCreated(created, false);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save rule");
    } finally {
      setSaving(false);
    }
  };
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const fieldSelectStyle = {
    width: "100%",
    padding: "0.6rem 0.8rem",
    background: "var(--field)",
    border: "1px solid var(--rule)",
    borderRadius: "8px",
    color: "var(--ink)",
    fontSize: "0.88rem",
    fontFamily: "var(--font-family)",
  };
  const labelStyle = {
    display: "block",
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
    marginBottom: "0.4rem",
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "520px",
        }}
      >
        <div className="modal-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <GitFork size={20} color="var(--ledger)" />
            <h2 className="modal-title">
              {isEditMode ? "Edit Rule" : "Create New Rule"}
            </h2>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            disabled={saving}
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          <div
            className="modal-body"
            style={{
              padding: "1.5rem",
            }}
          >
            {error && (
              <div
                className="modal-error"
                style={{
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gap: "1rem",
              }}
            >
              {/* Trigger Field */}
              <div>
                <label style={labelStyle}>
                  {t("createRuleModal.ifTriggerField")}
                </label>
                <select
                  style={fieldSelectStyle}
                  value={formData.trigger_field}
                  onChange={(e) =>
                    handleChange("trigger_field", e.target.value)
                  }
                >
                  <option value="">
                    {t("createRuleModal.selectTriggerField")}
                  </option>
                  {(fields || []).map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label} ({f.field_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Operator */}
              <div>
                <label style={labelStyle}>
                  {t("createRuleModal.operator")}
                </label>
                <select
                  style={fieldSelectStyle}
                  value={formData.operator}
                  onChange={(e) => handleChange("operator", e.target.value)}
                >
                  {OPERATORS.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Comparison Value */}
              <div>
                <label style={labelStyle}>
                  {t("createRuleModal.comparisonValue")}
                </label>
                <input
                  type="text"
                  style={{
                    ...fieldSelectStyle,
                    opacity: isComparisonDisabled ? 0.5 : 1,
                  }}
                  value={isComparisonDisabled ? "" : formData.comparison}
                  onChange={(e) => handleChange("comparison", e.target.value)}
                  disabled={isComparisonDisabled}
                  placeholder={
                    isComparisonDisabled
                      ? "Not required for this operator"
                      : "Enter comparison value..."
                  }
                />
              </div>

              {/* Action */}
              <div>
                <label style={labelStyle}>
                  {t("createRuleModal.thenAction")}
                </label>
                <select
                  style={fieldSelectStyle}
                  value={formData.action}
                  onChange={(e) => handleChange("action", e.target.value)}
                >
                  {ACTIONS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Field */}
              <div>
                <label style={labelStyle}>
                  {t("createRuleModal.targetField")}
                </label>
                <select
                  style={fieldSelectStyle}
                  value={formData.targeted_field}
                  onChange={(e) =>
                    handleChange("targeted_field", e.target.value)
                  }
                >
                  <option value="">
                    {t("createRuleModal.selectTargetField")}
                  </option>
                  {(fields || []).map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label} ({f.field_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Logical Group (optional) */}
              <div>
                <label style={labelStyle}>
                  {t("createRuleModal.logicalGroup")}
                  <span
                    style={{
                      fontWeight: 400,
                      color: "var(--text-muted)",
                    }}
                  >
                    {t("createRuleModal.optional")}
                  </span>
                </label>
                <input
                  type="text"
                  style={fieldSelectStyle}
                  value={formData.logical_group}
                  onChange={(e) =>
                    handleChange("logical_group", e.target.value)
                  }
                  placeholder={t("createRuleModal.eGGroupA")}
                />
              </div>
            </div>
          </div>

          <div
            className="modal-footer"
            style={{
              justifyContent: "flex-end",
              gap: "0.75rem",
            }}
          >
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              {t("createRuleModal.cancel")}
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{isEditMode ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                <>
                  <GitFork size={16} />
                  <span>{isEditMode ? "Update Rule" : "Create Rule"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
