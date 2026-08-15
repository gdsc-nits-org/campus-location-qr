'use client'

import { useState, useEffect, useRef } from 'react'

interface Location { id: string; slug: string; name: string }
interface Props { location: Location; onClose: () => void }

export default function QRModal({ location, onClose }: Props) {
  const [qrSrc, setQrSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [baseUrl, setBaseUrl] = useState('')
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    // Fetch config for auto-detected LAN IP / base URL
    fetch('/api/config')
      .then(r => r.json())
      .then(cfg => {
        const target = cfg.defaultBaseUrl || 'http://localhost:3000'
        setBaseUrl(target)
        loadQr(target)
      })
      .catch(() => {
        const fallback = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
        setBaseUrl(fallback)
        loadQr(fallback)
      })
  }, [location.id])

  function loadQr(targetUrl: string) {
    setLoading(true)
    fetch(`/api/locations/${location.id}/qr?baseUrl=${encodeURIComponent(targetUrl)}`)
      .then(r => r.blob())
      .then(blob => {
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
        const url = URL.createObjectURL(blob)
        objectUrlRef.current = url
        setQrSrc(url)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  const permanentUrl = `${baseUrl.replace(/\/$/, '')}/location/${location.slug}`

  function downloadQR() {
    const a = document.createElement('a')
    a.href = `/api/locations/${location.id}/qr?baseUrl=${encodeURIComponent(baseUrl)}`
    a.download = `qr-${location.slug}.png`
    a.click()
  }

  function copyUrl() {
    navigator.clipboard.writeText(permanentUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2>📲 Permanent QR Code</h2>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          <div style={{ textAlign: 'center', fontWeight: 600, marginBottom: 4, fontSize: 'var(--text-base)' }}>
            {location.name}
          </div>

          <div className="qr-preview-box">
            {loading ? (
              <div style={{ width: 200, height: 200, display: 'grid', placeItems: 'center', color: '#888', fontSize: 'var(--text-sm)' }}>
                Generating QR…
              </div>
            ) : qrSrc ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={qrSrc} alt={`QR code for ${location.name}`} width={200} height={200} />
            ) : (
              <div style={{ color: '#888', padding: 20, fontSize: 'var(--text-sm)' }}>Failed to generate QR</div>
            )}
          </div>

          <div style={{
            padding: '10px 14px',
            background: 'rgba(63,185,80,.07)',
            border: '1px solid rgba(63,185,80,.2)',
            borderRadius: 'var(--r-sm)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-2)',
            textAlign: 'center',
            lineHeight: 1.6
          }}>
            📱 Scan with your phone to get directions
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost btn-sm" onClick={copyUrl}>
            {copied ? '✅ Copied!' : '📋 Copy URL'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-primary btn-sm" onClick={downloadQR} disabled={loading}>
            ⬇️ Download PNG
          </button>
        </div>
      </div>
    </div>
  )
}
