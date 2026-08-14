'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Location {
  id: string
  slug: string
  name: string
  category: string
  isActive: boolean
}

export default function QRSheetPage() {
  const { status } = useSession()
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active'>('active')
  const [baseUrl, setBaseUrl] = useState('')
  const [isEditingBaseUrl, setIsEditingBaseUrl] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/admin/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return

    fetch('/api/config')
      .then(r => r.json())
      .then(cfg => setBaseUrl(cfg.defaultBaseUrl || 'http://localhost:3000'))
      .catch(() => {
        if (typeof window !== 'undefined') {
          setBaseUrl(`${window.location.protocol}//${window.location.host}`)
        }
      })

    fetch('/api/locations?all=true')
      .then(r => r.json())
      .then(data => { setLocations(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [status])

  const displayed = filter === 'active' ? locations.filter(l => l.isActive) : locations

  if (status === 'loading' || status === 'unauthenticated') {
    return <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', color: 'var(--text-3)' }}>Loading…</div>
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Topbar */}
      <div className="no-print" style={{
        background: 'var(--bg-2)', borderBottom: '1px solid var(--border)',
        padding: '12px clamp(16px,4vw,32px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/admin" className="btn btn-ghost btn-sm">← Back to Admin</Link>
          <h1 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>📋 QR Code Print Sheet</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 120 }}
            value={filter}
            onChange={e => setFilter(e.target.value as 'all' | 'active')}
          >
            <option value="active">Active only ({locations.filter(l => l.isActive).length})</option>
            <option value="all">All locations ({locations.length})</option>
          </select>
          <button className="btn btn-primary" onClick={() => window.print()}>
            🖨️ Print / Save PDF
          </button>
        </div>
      </div>

      <div style={{ padding: '24px clamp(16px,4vw,32px) 0' }}>
        {/* Base URL banner */}
        <div className="no-print" style={{
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)', padding: '16px', marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-3)', letterSpacing: '0.05em' }}>
                🔗 QR Encoded Target Base Domain
              </div>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--accent)', fontFamily: 'monospace', marginTop: 2 }}>
                {baseUrl || 'Detecting…'}
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsEditingBaseUrl(!isEditingBaseUrl)}>
              {isEditingBaseUrl ? '✓ Done' : '✏️ Change Domain / IP'}
            </button>
          </div>

          {isEditingBaseUrl && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <label className="form-label" htmlFor="qr-domain-input">Target Base URL for QR Codes</label>
              <input
                id="qr-domain-input"
                type="text"
                className="form-input"
                value={baseUrl}
                onChange={e => setBaseUrl(e.target.value)}
                placeholder="http://192.168.1.100:3000 or https://nav.campus.edu"
              />
              <div className="form-hint" style={{ marginTop: 6 }}>
                💡 <strong>Important:</strong> Mobile phones cannot reach <code>localhost</code>. Use your Wi-Fi IP (e.g. <code>http://192.168.x.x:3000</code>) for local testing, or your deployed domain for production.
              </div>
            </div>
          )}

          <div style={{
            marginTop: 12, fontSize: 'var(--text-xs)', color: 'var(--text-2)',
            background: 'rgba(47,129,247,.08)', padding: '10px 14px',
            borderRadius: 'var(--r-sm)', border: '1px solid rgba(47,129,247,.2)',
            display: 'flex', gap: 8, alignItems: 'flex-start'
          }}>
            <span>📱</span>
            <div>
              <strong>Why localhost fails when scanned?</strong> <code>localhost</code> points to the phone itself.
              We auto-detected your computer&apos;s Wi-Fi IP (<code>{baseUrl}</code>) so scanning from a phone on the same network works immediately!
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', placeItems: 'center', height: 200, color: 'var(--text-3)' }}>
            Loading QR codes…
          </div>
        ) : displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No locations found</h3>
            <p>Add locations from the admin dashboard first.</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-1)' }}>
                Campus QR Codes — {displayed.length} Location{displayed.length !== 1 ? 's' : ''}
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)', marginTop: '2px' }}>
                Permanent QR codes. Print once and place at each location.
              </p>
            </div>

            <div className="qr-sheet-grid">
              {displayed.map(loc => {
                const permanentUrl = `${baseUrl.replace(/\/$/, '')}/location/${loc.slug}`
                const qrImgSrc = `/api/locations/${loc.id}/qr?baseUrl=${encodeURIComponent(baseUrl)}`
                return (
                  <div key={loc.id} className="qr-sheet-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrImgSrc} alt={`QR for ${loc.name}`} width={140} height={140} />
                    <div className="qr-loc-name">{loc.name}</div>
                    <div className="qr-loc-url">{permanentUrl}</div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
