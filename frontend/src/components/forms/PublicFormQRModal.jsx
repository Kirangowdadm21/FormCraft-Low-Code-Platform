import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import {
  QrCode,
  Loader2,
  Download,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { createQRCode } from "../../services/qrApi";
import { safeCopyText } from "../../utils/clipboard";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { useToast } from "../common/Toast";
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
export default function PublicFormQRModal({
  isOpen,
  onClose,
  form,
  publicUrl,
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [copied, setCopied] = useState(false);
  const targetUrl =
    publicUrl ||
    (form ? `${window.location.origin}/#/public/forms/${form.id}` : "");
  useEffect(() => {
    if (!isOpen || !targetUrl) return;
    const generateOrFetchQR = async () => {
      try {
        setLoading(true);
        setError(null);
        let validUrl = targetUrl;
        if (
          !validUrl.startsWith("http://") &&
          !validUrl.startsWith("https://")
        ) {
          validUrl = `${window.location.protocol}//${window.location.host}${targetUrl}`;
        }
        const qr = await createQRCode(
          validUrl,
          form ? `QR: ${form.title}` : "Public Form QR",
        );
        setQrCodeData(qr);
      } catch (err) {
        console.error("Error generating QR code:", err);
        setError(err.message || "Failed to generate QR code");
      } finally {
        setLoading(false);
      }
    };
    generateOrFetchQR();
  }, [isOpen, targetUrl, form]);
  if (!isOpen) return null;
  const handleCopyLink = () => {
    safeCopyText(targetUrl).then(() => {
      setCopied(true);
      toast.success("Public URL copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    });
  };
  const getQrImageUrl = () => {
    if (qrCodeData && qrCodeData.qr_image_path) {
      const filename = qrCodeData.qr_image_path.split(/[/\\]/).pop();
      return `${BASE_URL}/static/qrcodes/${filename}`;
    }
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(targetUrl)}`;
  };
  const handleDownloadQR = async () => {
    try {
      const imgUrl = getQrImageUrl();
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `QR_${form ? form.title.replace(/\s+/g, "_") : "Form"}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("QR Code downloaded successfully");
    } catch (err) {
      toast.error("Right-click the image to save QR code");
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("publicFormQRModal.qrCodePublic")}
      maxWidth="max-w-md"
      footer={
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          <Button variant="outline" onClick={onClose}>
            {t("publicFormQRModal.close")}
          </Button>
          <Button
            variant="primary"
            leftIcon={Download}
            onClick={handleDownloadQR}
            disabled={loading}
          >
            {t("publicFormQRModal.downloadPng")}
          </Button>
        </div>
      }
    >
      <div
        style={{
          textAlign: "center",
          padding: "0.5rem 0",
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
            <span>{error}</span>
          </div>
        )}

        {form && (
          <h3
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              marginBottom: "0.25rem",
              color: "var(--ink)",
            }}
          >
            {form.title}
          </h3>
        )}
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--text-muted)",
            marginBottom: "1.25rem",
          }}
        >
          {t("publicFormQRModal.scanWithAnySmartphone")}
        </p>

        {/* QR Code Container */}
        <div
          style={{
            background: "#ffffff",
            padding: "1.25rem",
            borderRadius: "12px",
            border: "1px solid var(--rule)",
            display: "inline-block",
            boxShadow: "var(--card-shadow)",
            marginBottom: "1.25rem",
          }}
        >
          {loading ? (
            <div
              style={{
                width: "180px",
                height: "180px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
              }}
            >
              <Loader2
                size={32}
                className="animate-spin"
                style={{
                  color: "var(--ledger)",
                }}
              />
              <span
                style={{
                  fontSize: "0.8rem",
                  marginTop: "0.5rem",
                }}
              >
                {t("publicFormQRModal.generatingQr")}
              </span>
            </div>
          ) : (
            <img
              src={getQrImageUrl()}
              alt={t("publicFormQRModal.qrCode")}
              style={{
                width: "180px",
                height: "180px",
                display: "block",
                objectFit: "contain",
              }}
              onError={(e) => {
                e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(targetUrl)}`;
              }}
            />
          )}
        </div>

        {/* Public URL Box */}
        <div
          style={{
            background: "var(--field)",
            border: "1px solid var(--rule)",
            borderRadius: "8px",
            padding: "0.6rem 0.8rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              fontSize: "0.82rem",
              color: "var(--ink)",
              fontFamily: "var(--font-mono)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flex: 1,
              textAlign: "left",
            }}
          >
            {targetUrl}
          </span>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={copied ? Check : Copy}
            onClick={handleCopyLink}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
