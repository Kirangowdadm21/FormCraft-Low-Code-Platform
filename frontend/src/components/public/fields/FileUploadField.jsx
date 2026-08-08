import { useTranslation } from "react-i18next";
import React, { useRef, useState } from "react";
import { UploadCloud, X, FileText, AlertCircle, Loader2 } from "lucide-react";
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
export default function FileUploadField({
  field,
  value,
  onChange,
  error,
  disabled,
}) {
  const { t } = useTranslation();
  const fieldId = `field-${field.id}`;
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // If in preview mode, just show the file name
    if (disabled) return;
    setUploading(true);
    setUploadError(null);
    setFileName(file.name);
    setFileSize(file.size);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${BASE_URL}/uploads/`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Upload failed");
      }
      const data = await res.json();
      // Store the uploaded file ID as the field value
      onChange(
        JSON.stringify({
          file_id: data.id,
          filename: data.filename,
        }),
      );
    } catch (err) {
      setUploadError(err.message || "File upload failed. Please try again.");
      onChange("");
      setFileName(null);
      setFileSize(null);
    } finally {
      setUploading(false);
    }
  };
  const handleRemoveFile = () => {
    onChange("");
    setFileName(null);
    setFileSize(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };
  const hasFile = value && value !== "";
  return (
    <div className="public-field-group">
      <label className="public-field-label">
        {field.label}{" "}
        {field.required && (
          <span className="required-star">{t("fileUploadField.text")}</span>
        )}
      </label>

      {hasFile && !uploading ? (
        <div className="file-upload-preview-card">
          <div className="file-preview-info">
            <FileText size={20} className="file-icon" />
            <div>
              <span className="file-name-text">
                {fileName || t("fileUploadField.uploadedFile")}
              </span>
              {fileSize && (
                <span className="file-size-text">
                  {formatFileSize(fileSize)}
                </span>
              )}
            </div>
          </div>
          {!disabled && (
            <button
              type="button"
              className="file-remove-btn"
              onClick={handleRemoveFile}
              aria-label={t("fileUploadField.removeUploadedFile")}
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <div
          className={`file-upload-dropzone ${error ? "input-error" : ""} ${disabled ? "dropzone-disabled" : ""}`}
          onClick={() =>
            !disabled && !uploading && fileInputRef.current?.click()
          }
          onKeyDown={(e) => {
            if (
              (e.key === "Enter" || e.key === " ") &&
              !disabled &&
              !uploading
            ) {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={t("fileUploadField.uploadFileFor", { label: field.label })}
        >
          {uploading ? (
            <>
              <Loader2 size={28} className="animate-spin dropzone-icon" />
              <span className="dropzone-text">
                {t("fileUploadField.uploadingFile")}
              </span>
            </>
          ) : (
            <>
              <UploadCloud size={28} className="dropzone-icon" />
              <span className="dropzone-text">
                {t("fileUploadField.clickToUploadA")}
              </span>
              <span className="dropzone-hint">
                {t("fileUploadField.supportedPdfImagesDocuments")}
              </span>
            </>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        id={fieldId}
        className="visually-hidden"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        aria-hidden="true"
      />

      {uploadError && (
        <div className="field-error-message" role="alert">
          <AlertCircle size={14} />
          <span>{uploadError}</span>
        </div>
      )}

      {error && !uploadError && (
        <div className="field-error-message" role="alert">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
