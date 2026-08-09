import { useTranslation } from "react-i18next";
import React from "react";
import { Settings, Plus, Trash2, Sliders, Layers } from "lucide-react";

export default function FieldProperties({ selectedField, onUpdateField }) {
  const { t } = useTranslation();
  if (!selectedField) {
    return (
      <div
        className="builder-panel right-panel empty-properties"
        style={{
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div className="properties-guide font-muted">
          <Settings
            size={36}
            color="var(--text-muted)"
            style={{
              margin: "0 auto 1rem auto",
            }}
          />
          <h4
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "var(--ink)",
              marginBottom: "0.5rem",
            }}
          >
            {t("fieldProperties.noFieldSelected")}
          </h4>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
            }}
          >
            {t("fieldProperties.clickOnAnyField")}
          </p>
        </div>
      </div>
    );
  }
  const handleChange = (key, value) => {
    onUpdateField(selectedField.id, {
      [key]: value,
    });
  };
  const handleOptionChange = (index, key, value) => {
    const currentOptions = Array.isArray(selectedField.options)
      ? [...selectedField.options]
      : [];
    const targetOpt =
      typeof currentOptions[index] === "object"
        ? {
            ...currentOptions[index],
          }
        : {
            optiontext: currentOptions[index],
            value: currentOptions[index],
          };
    targetOpt[key] = value;
    if (key === "optiontext" && !targetOpt.value) {
      targetOpt.value = value.toLowerCase().replace(/\s+/g, "_");
    }
    currentOptions[index] = targetOpt;
    onUpdateField(selectedField.id, {
      options: currentOptions,
    });
  };
  const handleAddOption = () => {
    const currentOptions = Array.isArray(selectedField.options)
      ? [...selectedField.options]
      : [];
    const newIdx = currentOptions.length + 1;
    currentOptions.push({
      optiontext: `Option ${newIdx}`,
      value: `option_${newIdx}`,
      display_order: newIdx,
    });
    onUpdateField(selectedField.id, {
      options: currentOptions,
    });
  };
  const handleRemoveOption = (index) => {
    const currentOptions = Array.isArray(selectedField.options)
      ? [...selectedField.options]
      : [];
    currentOptions.splice(index, 1);
    onUpdateField(selectedField.id, {
      options: currentOptions,
    });
  };
  const hasOptions = ["dropdown", "radio", "checkbox"].includes(
    selectedField.field_type,
  );
  return (
    <div className="builder-panel right-panel">
      <div className="panel-header">
        <h3 className="properties-title">
          {t("fieldProperties.fieldProperties")}
        </h3>
        <span className="properties-subtitle">
          Editing: <span className="properties-subtitle-type">{selectedField.field_type.toUpperCase()}</span>
        </span>
      </div>

      <div className="properties-form-container">
        {/* Field Label */}
        <div className="properties-group">
          <label className="properties-label">
            {t("fieldProperties.fieldLabel")}
          </label>
          <input
            type="text"
            className="properties-input-field"
            value={selectedField.label || ""}
            onChange={(e) => handleChange("label", e.target.value)}
          />
        </div>

        {/* Field Code Identifier */}
        <div className="properties-group">
          <label className="properties-label">
            {t("fieldProperties.fieldCodeIdentifierFieldName")}
          </label>
          <input
            type="text"
            className="properties-input-field"
            placeholder={t("fieldProperties.eGEmailAddress")}
            value={selectedField.field_name || ""}
            onChange={(e) =>
              handleChange(
                "field_name",
                e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
              )
            }
          />
        </div>

        {/* Placeholder */}
        {selectedField.field_type !== "submit" && (
          <div className="properties-group">
            <label className="properties-label">
              {t("fieldProperties.placeholderText")}
            </label>
            <input
              type="text"
              className="properties-input-field"
              value={selectedField.placeholder || ""}
              onChange={(e) => handleChange("placeholder", e.target.value)}
            />
          </div>
        )}

        {/* Help Text */}
        <div className="properties-group">
          <label className="properties-label">
            {t("fieldProperties.helpDescriptionSubtext")}
          </label>
          <input
            type="text"
            className="properties-input-field"
            placeholder={t("fieldProperties.subtextShownBelowThe")}
            value={selectedField.help_text || ""}
            onChange={(e) => handleChange("help_text", e.target.value)}
          />
        </div>

        {/* Required Field checkbox */}
        <div className="properties-checkbox-row">
          <span className="properties-checkbox-label">
            {t("fieldProperties.requiredField")}
          </span>
          <input
            type="checkbox"
            className="properties-checkbox"
            checked={!!selectedField.required}
            onChange={(e) => handleChange("required", e.target.checked)}
          />
        </div>

        {/* Layout Width */}
        <div className="properties-group">
          <label className="properties-label">
            {t("fieldProperties.layoutWidth")}
          </label>
          <div className="properties-width-group">
            <button
              type="button"
              className={`properties-width-btn ${(!selectedField.width || selectedField.width === "full") ? "active" : ""}`}
              onClick={() => handleChange("width", "full")}
            >
              {t("fieldProperties.full100")}
            </button>
            <button
              type="button"
              className={`properties-width-btn ${selectedField.width === "half" ? "active" : ""}`}
              onClick={() => handleChange("width", "half")}
            >
              {t("fieldProperties.half50")}
            </button>
            <button
              type="button"
              className={`properties-width-btn ${selectedField.width === "third" ? "active" : ""}`}
              onClick={() => handleChange("width", "third")}
            >
              {t("fieldProperties.third33")}
            </button>
          </div>
        </div>

        {/* Dynamic Options Manager for Dropdown, Radio, Checkbox */}
        {hasOptions && (
          <div className="properties-section-divider">
            <div className="properties-section-title">
              <Layers size={16} />
              <span>{t("fieldProperties.optionsList")}</span>
            </div>

            <div className="options-manager-list">
              {(selectedField.options || []).map((opt, idx) => {
                const optText = typeof opt === "object" ? opt.optiontext : opt;
                return (
                  <div key={idx} className="properties-option-row">
                    <input
                      type="text"
                      className="properties-input-field properties-option-input"
                      value={optText}
                      onChange={(e) =>
                        handleOptionChange(idx, "optiontext", e.target.value)
                      }
                      placeholder={`Option ${idx + 1}`}
                    />
                    <button
                      type="button"
                      className="properties-delete-btn"
                      onClick={() => handleRemoveOption(idx)}
                      title={t("fieldProperties.removeOption")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="properties-add-btn"
              onClick={handleAddOption}
            >
              <Plus size={16} />
              {t("fieldProperties.addChoiceOption")}
            </button>
          </div>
        )}

        {/* Validation Rules Section */}
        <div className="properties-section-divider">
          <div className="properties-section-title">
            <Sliders size={16} />
            <span>{t("fieldProperties.validationRules")}</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div className="properties-group">
              <label className="properties-label">
                {t("fieldProperties.minimumLengthValue")}
              </label>
              <input
                type="number"
                className="properties-input-field"
                placeholder={t("fieldProperties.eG1")}
                value={
                  selectedField.validation_conf?.min_length ??
                  selectedField.validation_conf?.min_value ??
                  ""
                }
                onChange={(e) =>
                  handleChange("validation_conf", {
                    ...selectedField.validation_conf,
                    min_length: e.target.value ? Number(e.target.value) : null,
                    min_value: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>

            <div className="properties-group">
              <label className="properties-label">
                {t("fieldProperties.maximumLengthValue")}
              </label>
              <input
                type="number"
                className="properties-input-field"
                placeholder={t("fieldProperties.eG255")}
                value={
                  selectedField.validation_conf?.max_length ??
                  selectedField.validation_conf?.max_value ??
                  ""
                }
                onChange={(e) =>
                  handleChange("validation_conf", {
                    ...selectedField.validation_conf,
                    max_length: e.target.value ? Number(e.target.value) : null,
                    max_value: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
