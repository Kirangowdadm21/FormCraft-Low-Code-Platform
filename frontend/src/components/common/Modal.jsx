import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import { X } from "lucide-react";
export default function Modal({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
  footer,
  maxWidth = "max-w-lg",
  className = "",
}) {
  const { t } = useTranslation();
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div className="fc-modal-overlay" onClick={onClose}>
      <div
        className={`fc-modal-card ${maxWidth} ${className}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="fc-modal-header">
          <div className="fc-modal-title-group">
            {Icon && <Icon size={20} className="fc-modal-icon" />}
            <h2 className="fc-modal-title">{title}</h2>
          </div>
          <button
            type="button"
            className="fc-modal-close-btn"
            onClick={onClose}
            aria-label={t("modal.closeModal")}
          >
            <X size={18} />
          </button>
        </div>
        <div className="fc-modal-body">{children}</div>
        {footer && <div className="fc-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
