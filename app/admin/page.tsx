'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminSidebar from '@/components/AdminSidebar'
import LocationFormModal from '@/components/LocationFormModal'
import QRModal from '@/components/QRModal'
import ChangePasswordModal from '@/components/ChangePasswordModal'

interface Location {
  id: string; slug: string; name: string; description: string | null
  category: string; latitude: number | null; longitude: number | null
  mapsUrl: string | null; imageUrl: string | null; isActive: boolean; updatedAt: string
}

const ICONS: Record<string, string> = {
  Academic:'🎓', Hostel:'🏠', Administration:'🏛️', Food:'🍽️',
  Sports:'⚽', Healthcare:'🏥', Events:'🎭', Innovation:'🚀',
  Infrastructure:'🚪', General:'📍',
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [filtered, setFiltered] = useState<Location[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showPassModal, setShowPassModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Location | null>(null)
  const [qrTarget, setQrTarget] = useState<Location | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/admin/login')
  }, [status, router])

  const fetchLocations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/locations?all=true')
      const data = await res.json()
      setLocations(Array.isArray(data) ? data : [])
      setFiltered(Array.isArray(data) ? data : [])
    } catch { showToast('error', 'Failed to load locations') }
    setLoading(false)
  }, [])

  useEffect(() => { if (status === 'authenticated') fetchLocations() }, [status, fetchLocations])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(q ? locations.filter(l =>
      l.name.toLowerCase().includes(q) || l.slug.toLowerCase().includes(q) || l.category.toLowerCase().includes(q)
    ) : locations)
  }, [search, locations])

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  async function toggleActive(loc: Location) {
    try {
      await fetch(`/api/locations/${loc.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !loc.isActive }),
      })
      showToast('success', `${loc.name} ${!loc.isActive ? 'enabled' : 'disabled'}`)
      fetchLocations()
    } catch { showToast('error', 'Update failed') }
  }

  async function deleteLocation(loc: Location) {
    if (!confirm(`Delete "${loc.name}"? This cannot be undone.`)) return
    try {
      await fetch(`/api/locations/${loc.id}`, { method: 'DELETE' })
      showToast('success', `${loc.name} deleted`)
      fetchLocations()
    } catch { showToast('error', 'Delete failed') }
  }

  async function onFormSuccess() {
    setShowForm(false); setEditTarget(null)
    await fetchLocations()
    showToast('success', editTarget ? 'Location updated!' : 'Location created!')
  }

  if (status === 'loading' || status === 'unauthenticated') {
    return <div style={{ display:'grid', placeItems:'center', minHeight:'100vh', color:'var(--text-3)' }}>Loading…</div>
  }

  const stats = {
    total: locations.length,
    active: locations.filter(l => l.isActive).length,
    inactive: locations.filter(l => !l.isActive).length,
    categories: [...new Set(locations.map(l => l.category))].length,
  }

  return (
    <div className="admin-layout">
      <AdminSidebar active="locations" onChangePassword={() => setShowPassModal(true)} />

      <div className="admin-main">
          <div className="admin-topbar">
          <h1>📍 Location Management</h1>
          <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border)' }}>
              🏛️ View Public Directory
            </Link>
            <Link href="/admin/qr-sheet" className="btn btn-secondary btn-sm">📋 Print All QRs</Link>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditTarget(null); setShowForm(true) }}>
              + Add Location
            </button>
          </div>
        </div>

        <div className="admin-content">
          {toast && (
            <div className={`alert alert-${toast.type}`} style={{
              position:'fixed', top:'70px', right:'20px', zIndex:9999,
              minWidth:'260px', maxWidth:'320px', animation:'slideUp .2s ease', boxShadow:'var(--shadow-lg)'
            }}>
              {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
            </div>
          )}

          <div className="stats-grid">
            {[
              { icon:'📍', val: stats.total,      name:'Total',      color: '' },
              { icon:'✅', val: stats.active,     name:'Active',     color: 'var(--green)' },
              { icon:'⏸️', val: stats.inactive,   name:'Inactive',   color: 'var(--red)' },
              { icon:'🏷️', val: stats.categories, name:'Categories', color: 'var(--accent)' },
            ].map(s => (
              <div key={s.name} className="stat-card">
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value" style={s.color ? { color: s.color } : {}}>{s.val}</div>
                <div className="stat-name">{s.name}</div>
              </div>
            ))}
          </div>

          <div className="table-container">
            <div className="table-toolbar">
              <div className="table-toolbar-left">
                <div className="search-input-wrap table-search">
                  <span className="search-icon">🔍</span>
                  <input
                    type="search"
                    className="form-input"
                    placeholder="Search locations…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <span style={{ fontSize:'var(--text-xs)', color:'var(--text-3)', whiteSpace:'nowrap' }}>
                  {filtered.length} / {locations.length}
                </span>
              </div>
            </div>

            <div className="table-wrap">
              {loading ? (
                <div className="empty-state"><div className="empty-icon">⏳</div><h3>Loading…</h3></div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>No locations yet</h3>
                  <p>Add your first location to get started</p>
                  <button className="btn btn-primary btn-sm" style={{ marginTop:'8px' }}
                    onClick={() => { setEditTarget(null); setShowForm(true) }}>
                    + Add Location
                  </button>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Location</th>
                      <th>Category</th>
                      <th>Photo</th>
                      <th>Status</th>
                      <th>Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(loc => (
                      <tr key={loc.id}>
                        <td>
                          <div className="location-name-cell">{ICONS[loc.category] || '📍'} {loc.name}</div>
                          <div className="location-slug-cell">/location/{loc.slug}</div>
                        </td>
                        <td>
                          <span className={`badge badge-${loc.category.toLowerCase().replace(/\s+/g,'-')}`}>
                            {loc.category}
                          </span>
                        </td>
                        <td>
                          {loc.imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={loc.imageUrl} alt={loc.name}
                              style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)' }} />
                          ) : (
                            <span style={{ color: 'var(--text-3)', fontSize: 'var(--text-xs)' }}>—</span>
                          )}
                        </td>
                        <td>
                          <button
                            className={`badge ${loc.isActive ? 'badge-active' : 'badge-inactive'}`}
                            style={{ cursor:'pointer', border:'none', fontFamily:'inherit', background:'inherit' }}
                            onClick={() => toggleActive(loc)}
                            title="Click to toggle"
                          >
                            {loc.isActive ? '● Active' : '○ Inactive'}
                          </button>
                        </td>
                        <td style={{ fontSize:'var(--text-xs)', color:'var(--text-3)', whiteSpace:'nowrap' }}>
                          {new Date(loc.updatedAt).toLocaleDateString('en-IN')}
                        </td>
                        <td>
                          <div className="table-actions">
                            <Link href={`/location/${loc.slug}`} target="_blank"
                              className="btn btn-ghost btn-sm btn-icon" title="Preview location page">👁️</Link>
                            <button className="btn btn-ghost btn-sm btn-icon"
                              onClick={() => setQrTarget(loc)} title="Download QR code">📲</button>
                            <button className="btn btn-secondary btn-sm"
                              onClick={() => { setEditTarget(loc); setShowForm(true) }}>✏️ Edit</button>
                            <button className="btn btn-danger btn-sm btn-icon"
                              onClick={() => deleteLocation(loc)} title="Delete location">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <LocationFormModal
          location={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
          onSuccess={onFormSuccess}
        />
      )}
      {qrTarget && <QRModal location={qrTarget} onClose={() => setQrTarget(null)} />}
      {showPassModal && (
        <ChangePasswordModal
          onClose={() => setShowPassModal(false)}
          onSuccess={() => {
            setShowPassModal(false)
            showToast('success', 'Password updated successfully')
          }}
        />
      )}
    </div>
  )
}
