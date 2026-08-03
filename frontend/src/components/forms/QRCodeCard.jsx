import React, { useState } from 'react';
import { QrCode, Download, Copy, Check, Trash2, ExternalLink } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function QRCodeCard({ qrcode, onDelete }) {
  const [copied, setCopied] = useState(false);

  if (!qrcode) return null;

  const handleCopy = () => {
    if (qrcode.target_url) {
      navigator.clipboard.writeText(qrcode.target_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getQrImageUrl = () => {
    if (qrcode.qr_image_path) {
      const filename = qrcode.qr_image_path.split(/[/\\]/).pop();
      return `${BASE_URL}/static/qrcodes/${filename}`;
    }
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrcode.target_url)}`;
  };

  const handleDownload = async () => {
    try {
      const imgUrl = getQrImageUrl();
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR_${(qrcode.title || 'Code').replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Could not download image directly. You can right-click the image to save.');
    }
  };

  return (
    <div
      style={{
        background: 'var(--card-bg)',
        borderRadius: '12px',
        border: '1px solid var(--rule)',
        padding: '1.25rem',
        boxShadow: 'var(--card-shadow)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)' }}>
          {qrcode.title || 'QR Code'}
        </h4>
        {onDelete && (
          <button
            className="btn-destructive-subtle"
            onClick={() => onDelete(qrcode.id)}
            title="Delete QR Code"
            style={{ padding: '0.25rem' }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--rule)' }}>
        <img
          src={getQrImageUrl()}
          alt={qrcode.title || 'QR Code'}
          style={{ width: '140px', height: '140px', objectFit: 'contain', display: 'block' }}
          onError={(e) => {
            e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrcode.target_url)}`;
          }}
        />
      </div>

      <span
        style={{
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          maxWidth: '100%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {qrcode.target_url}
      </span>

      <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.25rem' }}>
        <button
          className="btn-secondary"
          onClick={handleCopy}
          style={{ flex: 1, padding: '0.4rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
        >
          {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy URL'}</span>
        </button>
        <button
          className="btn-primary"
          onClick={handleDownload}
          style={{ flex: 1, padding: '0.4rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
        >
          <Download size={14} />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
}
