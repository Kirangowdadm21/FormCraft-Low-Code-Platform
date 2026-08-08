import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useMemo } from "react";
import {
  GitCompare,
  X,
  PlusCircle,
  MinusCircle,
  Edit3,
  CheckCircle2,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";
export default function VersionCompareModal({
  isOpen,
  onClose,
  currentVersionObj,
  allVersions,
  onToast,
}) {
  const { t } = useTranslation();
  const [selectedBaseVersionNum, setSelectedBaseVersionNum] = useState(null);

  // Filter out the current selected version from potential compare bases
  const availableBases = useMemo(() => {
    if (!allVersions || !currentVersionObj) return [];
    return allVersions
      .filter((v) => v.version_number !== currentVersionObj.version_number)
      .sort((a, b) => b.version_number - a.version_number);
  }, [allVersions, currentVersionObj]);

  // Set default base version to the version just below the target version (or the first available)
  useEffect(() => {
    if (isOpen && currentVersionObj && availableBases.length > 0) {
      const lowerVersion = availableBases.find(
        (v) => v.version_number < currentVersionObj.version_number,
      );
      const defaultBase = lowerVersion
        ? lowerVersion.version_number
        : availableBases[0].version_number;
      setSelectedBaseVersionNum(defaultBase);
      if (onToast) {
        onToast("Version Comparison Loaded", "info");
      }
    }
  }, [isOpen, currentVersionObj, availableBases]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
  const baseVersionObj = useMemo(() => {
    if (!selectedBaseVersionNum || !allVersions) return null;
    return allVersions.find(
      (v) => v.version_number === Number(selectedBaseVersionNum),
    );
  }, [selectedBaseVersionNum, allVersions]);

  // Frontend field comparison logic
  const diffResult = useMemo(() => {
    if (!currentVersionObj || !baseVersionObj) {
      return {
        added: [],
        removed: [],
        modified: [],
        unchanged: [],
      };
    }
    const fieldsA = currentVersionObj.fields || []; // Target version (newer)
    const fieldsB = baseVersionObj.fields || []; // Base version (older)

    const added = [];
    const removed = [];
    const modified = [];
    const unchanged = [];

    // Helper to identify field identity key
    const getFieldKey = (f) =>
      (f.name || f.label || `id_${f.id}`).toLowerCase().trim();
    const mapB = new Map();
    fieldsB.forEach((f) => {
      mapB.set(getFieldKey(f), f);
    });
    const processedBKeys = new Set();
    fieldsA.forEach((fA) => {
      const keyA = getFieldKey(fA);
      const fB = mapB.get(keyA);
      if (!fB) {
        // Added field in Version A
        added.push(fA);
      } else {
        processedBKeys.add(keyA);
        // Check for modifications
        const changes = [];
        if (fA.label !== fB.label) {
          changes.push(`Label updated from "${fB.label}" to "${fA.label}"`);
        }
        if (fA.field_type !== fB.field_type) {
          changes.push(
            `Type changed from "${fB.field_type}" to "${fA.field_type}"`,
          );
        }
        if (!!fA.required !== !!fB.required) {
          changes.push(
            `Required state changed to ${fA.required ? "Required" : "Optional"}`,
          );
        }
        const optA = JSON.stringify(fA.options || []);
        const optB = JSON.stringify(fB.options || []);
        if (optA !== optB) {
          changes.push(`Options updated`);
        }
        if (changes.length > 0) {
          modified.push({
            field: fA,
            baseField: fB,
            changes,
          });
        } else {
          unchanged.push(fA);
        }
      }
    });

    // Removed fields (in Version B but not in A)
    fieldsB.forEach((fB) => {
      const keyB = getFieldKey(fB);
      if (!processedBKeys.has(keyB)) {
        removed.push(fB);
      }
    });
    return {
      added,
      removed,
      modified,
      unchanged,
    };
  }, [currentVersionObj, baseVersionObj]);
  if (!isOpen || !currentVersionObj) return null;
  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="version-compare-title"
    >
      <div
        className="modal-content modal-lg version-compare-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div className="compare-modal-icon-badge">
              <GitCompare size={20} />
            </div>
            <div>
              <h2 id="version-compare-title" className="modal-title">
                {t("versionCompareModal.versionComparison")}
              </h2>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                }}
              >
                {t("versionCompareModal.comparingTargetVersionWith")}
              </span>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label={t("versionCompareModal.closeVersionComparisonDialog")}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Comparison Selector Bar */}
          <div className="compare-selector-card">
            <div className="compare-version-box target-box">
              <span className="compare-box-tag">
                {t("versionCompareModal.targetVersion")}
              </span>
              <div className="compare-box-val">
                <Layers size={16} />
                <span>
                  {t("versionCompareModal.version")}
                  {currentVersionObj.version_number}
                </span>
                <span
                  className={`badge ${currentVersionObj.ispublished ? "badge-success" : "badge-draft"} badge-sm`}
                >
                  {currentVersionObj.ispublished ? "Published" : "Draft"}
                </span>
              </div>
            </div>

            <div className="compare-arrow-divider">
              <span>{t("versionCompareModal.with")}</span>
              <ArrowRight size={18} />
            </div>

            <div className="compare-version-box base-box">
              <span className="compare-box-tag">
                {t("versionCompareModal.baseVersion")}
              </span>
              {availableBases.length === 0 ? (
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                  }}
                >
                  {t("versionCompareModal.noOtherVersionsAvailable")}
                </div>
              ) : (
                <select
                  id="compare-base-select"
                  className="compare-select-dropdown"
                  value={selectedBaseVersionNum || ""}
                  onChange={(e) => {
                    setSelectedBaseVersionNum(Number(e.target.value));
                    if (onToast) onToast("Version Comparison Loaded", "info");
                  }}
                  aria-label={t("versionCompareModal.selectBaseVersionTo")}
                >
                  {availableBases.map((v) => (
                    <option
                      key={v.id || v.version_number}
                      value={v.version_number}
                    >
                      {t("versionCompareModal.version")}
                      {v.version_number}
                      {t("versionCompareModal.text")}
                      {v.fields ? v.fields.length : 0}
                      {t("versionCompareModal.fields")}
                      {v.ispublished ? ", Published" : ""}
                      {t("versionCompareModal.text")}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Comparison Results Summary Header */}
          {baseVersionObj ? (
            <div className="compare-stats-strip">
              <div className="compare-stat-pill pill-added">
                <PlusCircle size={14} />
                <span>
                  {t("versionCompareModal.added")}
                  {diffResult.added.length}
                </span>
              </div>
              <div className="compare-stat-pill pill-removed">
                <MinusCircle size={14} />
                <span>
                  {t("versionCompareModal.removed")}
                  {diffResult.removed.length}
                </span>
              </div>
              <div className="compare-stat-pill pill-modified">
                <Edit3 size={14} />
                <span>
                  {t("versionCompareModal.modified")}
                  {diffResult.modified.length}
                </span>
              </div>
              <div className="compare-stat-pill pill-unchanged">
                <CheckCircle2 size={14} />
                <span>
                  {t("versionCompareModal.unchanged")}
                  {diffResult.unchanged.length}
                </span>
              </div>
            </div>
          ) : null}

          {/* Comparison Details Sections */}
          {!baseVersionObj ? (
            <div className="compare-empty-state">
              <Sparkles
                size={32}
                style={{
                  opacity: 0.3,
                }}
              />
              <p>{t("versionCompareModal.pleaseSelectAnotherVersion")}</p>
            </div>
          ) : (
            <div className="compare-diff-container">
              {/* ADDED FIELDS SECTION */}
              <div className="compare-diff-section">
                <div className="diff-section-header header-added">
                  <PlusCircle size={16} />
                  <h4>
                    {t("versionCompareModal.addedFields")}
                    {diffResult.added.length}
                    {t("versionCompareModal.text")}
                  </h4>
                </div>
                {diffResult.added.length === 0 ? (
                  <p className="diff-none-text">
                    {t("versionCompareModal.noNewFieldsAdded")}
                    {currentVersionObj.version_number}
                    {t("versionCompareModal.text")}
                  </p>
                ) : (
                  <div className="diff-fields-grid">
                    {diffResult.added.map((f, idx) => (
                      <div
                        className="diff-field-card card-added"
                        key={f.id || idx}
                      >
                        <div className="diff-field-title-row">
                          <span className="diff-field-name">
                            {f.label || "Untitled Field"}
                          </span>
                          <span className="badge badge-success badge-sm">
                            {f.field_type}
                          </span>
                        </div>
                        {f.required && (
                          <span className="diff-required-tag">
                            {t("versionCompareModal.required")}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* REMOVED FIELDS SECTION */}
              <div className="compare-diff-section">
                <div className="diff-section-header header-removed">
                  <MinusCircle size={16} />
                  <h4>
                    {t("versionCompareModal.removedFields")}
                    {diffResult.removed.length}
                    {t("versionCompareModal.text")}
                  </h4>
                </div>
                {diffResult.removed.length === 0 ? (
                  <p className="diff-none-text">
                    {t("versionCompareModal.noFieldsRemovedCompared")}
                    {baseVersionObj.version_number}
                    {t("versionCompareModal.text")}
                  </p>
                ) : (
                  <div className="diff-fields-grid">
                    {diffResult.removed.map((f, idx) => (
                      <div
                        className="diff-field-card card-removed"
                        key={f.id || idx}
                      >
                        <div className="diff-field-title-row">
                          <span className="diff-field-name">
                            {f.label || "Untitled Field"}
                          </span>
                          <span className="badge badge-draft badge-sm">
                            {f.field_type}
                          </span>
                        </div>
                        <span className="diff-removed-note">
                          {t("versionCompareModal.presentInV")}
                          {baseVersionObj.version_number}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MODIFIED FIELDS SECTION */}
              <div className="compare-diff-section">
                <div className="diff-section-header header-modified">
                  <Edit3 size={16} />
                  <h4>
                    {t("versionCompareModal.modifiedFields")}
                    {diffResult.modified.length}
                    {t("versionCompareModal.text")}
                  </h4>
                </div>
                {diffResult.modified.length === 0 ? (
                  <p className="diff-none-text">
                    {t("versionCompareModal.noModifiedFieldsBetween")}
                  </p>
                ) : (
                  <div className="diff-fields-grid">
                    {diffResult.modified.map(({ field, changes }, idx) => (
                      <div
                        className="diff-field-card card-modified"
                        key={field.id || idx}
                      >
                        <div className="diff-field-title-row">
                          <span className="diff-field-name">
                            {field.label || "Untitled Field"}
                          </span>
                          <span className="badge badge-warning badge-sm">
                            {field.field_type}
                          </span>
                        </div>
                        <ul className="diff-changes-list">
                          {changes.map((change, cIdx) => (
                            <li key={cIdx}>{change}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {t("versionCompareModal.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
