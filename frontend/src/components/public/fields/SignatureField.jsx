import { useTranslation } from "react-i18next";
import React, { useRef, useState, useEffect } from "react";
import { PenTool, Trash2, AlertCircle } from "lucide-react";
export default function SignatureField({
  field,
  value,
  onChange,
  error,
  disabled,
}) {
  const { t } = useTranslation();
  const fieldId = `field-${field.id}`;
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  useEffect(() => {
    if (value && canvasRef.current) {
      setHasSignature(true);
    }
  }, [value]);
  const getPosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };
  const startDrawing = (e) => {
    if (disabled) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };
  const draw = (e) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPosition(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1C1B19";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    setHasSignature(true);
  };
  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      onChange(dataUrl);
    }
  };
  const clearSignature = () => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasSignature(false);
    onChange("");
  };
  return (
    <div className="public-field-group">
      <label className="public-field-label">
        {field.label}{" "}
        {field.required && (
          <span className="required-star">{t("signatureField.text")}</span>
        )}
      </label>

      <div className={`signature-pad-container ${error ? "input-error" : ""}`}>
        <canvas
          ref={canvasRef}
          id={fieldId}
          width={400}
          height={150}
          className="signature-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          aria-label={t("signatureField.signaturePadFor", { label: field.label })}
        />

        {!hasSignature && !disabled && (
          <div className="signature-placeholder">
            <PenTool size={20} />
            <span>{t("signatureField.drawYourSignatureHere")}</span>
          </div>
        )}

        {hasSignature && !disabled && (
          <button
            type="button"
            className="signature-clear-btn"
            onClick={clearSignature}
            aria-label={t("signatureField.clearSignature")}
          >
            <Trash2 size={14} />
            <span>{t("signatureField.clear")}</span>
          </button>
        )}
      </div>

      {error && (
        <div className="field-error-message" role="alert">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
