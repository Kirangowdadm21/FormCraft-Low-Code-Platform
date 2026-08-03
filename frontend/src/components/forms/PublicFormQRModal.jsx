import React, { useState, useEffect } from 'react';
import { QrCode, X, Loader2, Download, Copy, Check, ExternalLink, AlertCircle } from 'lucide-react';
import { createQRCode } from '../../services/qrApi';
import { safeCopyText } from '../../utils/clipboard';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function PublicFormQRModal({ isOpen, onClose, form, publicUrl }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [copied, setCopied] = useState(false);

  const targetUrl = publicUrl || (form ? `${window.location.origin}/#/public/forms/${form.id}` : '');

  useEffect(() => {
    if (!isOpen || !targetUrl) return;

    const generateOrFetchQR = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ensure valid absolute HTTP/HTTPS URL format for the backend QR API
        let validUrl = targetUrl;
        if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
          validUrl = `${window.location.protocol}//${window.location.host}${targetUrl}`;
        }

        const qr = await createQRCode(validUrl, form ? `QR: ${form.title}` : 'Public Form QR');
        setQrCodeData(qr);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError(err.message || 'Failed to generate QR code');
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
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Convert raw relative backend path (e.g. backend/uploads/qrcodes/xxx.png) to static backend file URL or fallback to Google Charts QR image API if needed
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
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR_${form ? form.title.replace(/\s+/g, '_') : 'Form'}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not download image directly. You can right-click the QR code image and choose "Save Image As".');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', textAlign: 'center' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <QrCode size={20} color="var(--ledger)" />
            <h2 className="modal-title">QR Code & Public Link</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem' }}>
          {error && (
            <div className="modal-error" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form Title */}
          {form && (
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--ink)' }}>
              {form.title}
            </h3>
          )}
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Scan with any smartphone camera to open and submit this form directly.
          </p>

          {/* QR Code Container */}
          <div
            style={{
              background: '#ffffff',
              padding: '1.25rem',
              borderRadius: '12px',
              border: '1px solid var(--rule)',
              display: 'inline-block',
              boxShadow: 'var(--card-shadow)',
              marginBottom: '1.25rem',
            }}
          >
            {loading ? (
              <div style={{ width: '180px', height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--ledger)' }} />
                <span style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Generating QR...</span>
              </div>
            ) : (
              <img
                src={getQrImageUrl()}
                alt="QR Code"
                style={{ width: '180px', height: '180px', display: 'block', objectFit: 'contain' }}
                onError={(e) => {
                  // Fallback to QR server API if local static file serving fails
                  e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(targetUrl)}`;
                }}
              />
            )}
          </div>

          {/* Public URL Box */}
          <div
            style={{
              background: 'var(--field)',
              border: '1px solid var(--rule)',
              borderRadius: '8px',
              padding: '0.6rem 0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <span
              style={{
                fontSize: '0.82rem',
                color: 'var(--ink)',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1,
                textAlign: 'left',
              }}
            >
              {targetUrl}
            </span>
            <button
              className="btn-tertiary"
              onClick={handleCopyLink}
              title="Copy Link"
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'center', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary" onClick={handleDownloadQR} disabled={loading}>
            <Download size={16} />
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
}
