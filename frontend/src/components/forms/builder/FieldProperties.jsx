import { useTranslation } from "react-i18next";
import React from "react";
import { Settings, Plus, Trash2, Sliders, Layers } from "lucide-react";
import Input from "../../common/Input";
import Button from "../../common/Button";
import Card from "../../common/Card";
import Badge from "../../common/Badge";
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
      <div
        className="panel-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.25rem",
          paddingBottom: "0.75rem",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--ink)",
              margin: 0,
            }}
          >
            {t("fieldProperties.fieldProperties")}
          </h3>
          <span
            className="panel-subtitle"
            style={{
              fontSize: "0.78rem",
              color: "var(--text-muted)",
            }}
          >
            {t("fieldProperties.editingTargetField")}
          </span>
        </div>
        <Badge variant="outline">
          {selectedField.field_type.toUpperCase()}
        </Badge>
      </div>

      <div
        className="properties-content"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* Label & Field Slug */}
        <Input
          label={t("fieldProperties.fieldLabel")}
          type="text"
          value={selectedField.label || ""}
          onChange={(e) => handleChange("label", e.target.value)}
        />

        <Input
          label={t("fieldProperties.fieldCodeIdentifierFieldName")}
          type="text"
          placeholder={t("fieldProperties.eGEmailAddress")}
          value={selectedField.field_name || ""}
          onChange={(e) =>
            handleChange(
              "field_name",
              e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
            )
          }
        />

        {/* Placeholder */}
        {selectedField.field_type !== "submit" && (
          <Input
            label={t("fieldProperties.placeholderText")}
            type="text"
            value={selectedField.placeholder || ""}
            onChange={(e) => handleChange("placeholder", e.target.value)}
          />
        )}

        {/* Help Text */}
        <Input
          label={t("fieldProperties.helpDescriptionSubtext")}
          type="text"
          placeholder={t("fieldProperties.subtextShownBelowThe")}
          value={selectedField.help_text || ""}
          onChange={(e) => handleChange("help_text", e.target.value)}
        />

        {/* Required Toggle Switch */}
        <Card
          style={{
            padding: "0.75rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span
              style={{
                fontWeight: 600,
                fontSize: "0.875rem",
                color: "var(--ink)",
                display: "block",
              }}
            >
              {t("fieldProperties.requiredField")}
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
              }}
            >
              {t("fieldProperties.submissionsRequireThisValue")}
            </span>
          </div>
          <input
            type="checkbox"
            className="toggle-checkbox"
            checked={!!selectedField.required}
            onChange={(e) => handleChange("required", e.target.checked)}
            style={{
              width: "18px",
              height: "18px",
              cursor: "pointer",
              accentColor: "var(--ledger)",
            }}
          />
        </Card>

        {/* Layout Width */}
        <div className="form-group">
          <label
            className="form-label"
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--ink)",
              marginBottom: "0.35rem",
              display: "block",
            }}
          >
            {t("fieldProperties.layoutWidth")}
          </label>
          <div
            className="width-btn-group"
            style={{
              display: "flex",
              gap: "0.35rem",
            }}
          >
            <Button
              variant={
                !selectedField.width || selectedField.width === "full"
                  ? "primary"
                  : "outline"
              }
              size="sm"
              onClick={() => handleChange("width", "full")}
              style={{
                flex: 1,
              }}
            >
              {t("fieldProperties.full100")}
            </Button>
            <Button
              variant={selectedField.width === "half" ? "primary" : "outline"}
              size="sm"
              onClick={() => handleChange("width", "half")}
              style={{
                flex: 1,
              }}
            >
              {t("fieldProperties.half50")}
            </Button>
            <Button
              variant={selectedField.width === "third" ? "primary" : "outline"}
              size="sm"
              onClick={() => handleChange("width", "third")}
              style={{
                flex: 1,
              }}
            >
              {t("fieldProperties.third33")}
            </Button>
          </div>
        </div>

        {/* Dynamic Options Manager for Dropdown, Radio, Checkbox */}
        {hasOptions && (
          <Card
            padding="p-4"
            style={{
              marginTop: "0.5rem",
            }}
          >
            <div
              className="section-title"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.75rem",
                fontWeight: 700,
                fontSize: "0.875rem",
              }}
            >
              <Layers size={16} color="var(--ledger)" />
              <span>{t("fieldProperties.optionsList")}</span>
            </div>

            <div
              className="options-manager-list"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {(selectedField.options || []).map((opt, idx) => {
                const optText = typeof opt === "object" ? opt.optiontext : opt;
                return (
                  <div
                    key={idx}
                    className="option-row"
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <Input
                        type="text"
                        value={optText}
                        onChange={(e) =>
                          handleOptionChange(idx, "optiontext", e.target.value)
                        }
                        placeholder={`Option ${idx + 1}`}
                      />
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={Trash2}
                      onClick={() => handleRemoveOption(idx)}
                      title={t("fieldProperties.removeOption")}
                    />
                  </div>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={Plus}
              onClick={handleAddOption}
              style={{
                marginTop: "0.75rem",
                width: "100%",
                justifyContent: "center",
              }}
            >
              {t("fieldProperties.addChoiceOption")}
            </Button>
          </Card>
        )}

        {/* Validation Rules Section */}
        <Card
          padding="p-4"
          style={{
            marginTop: "0.5rem",
          }}
        >
          <div
            className="section-title"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.75rem",
              fontWeight: 700,
              fontSize: "0.875rem",
            }}
          >
            <Sliders size={16} color="var(--ledger)" />
            <span>{t("fieldProperties.validationRules")}</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <Input
              label={t("fieldProperties.minimumLengthValue")}
              type="number"
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

            <Input
              label={t("fieldProperties.maximumLengthValue")}
              type="number"
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
        </Card>
      </div>
    </div>
  );
}
