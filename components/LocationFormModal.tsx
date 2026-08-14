'use client'

import { useState, useEffect, FormEvent, ChangeEvent } from 'react'

interface Location {
  id: string; slug: string; name: string; description: string | null
  category: string; latitude: number | null; longitude: number | null
  mapsUrl: string | null; imageUrl: string | null; isActive: boolean
}
interface Props { location: Location | null; onClose: () => void; onSuccess: () => void }

const CATS = ['Academic','Hostel','Administration','Food','Sports','Healthcare','Events','Innovation','Infrastructure','General']

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export default function LocationFormModal({ location, onClose, onSuccess }: Props) {
  const isEdit = !!location
  const [form, setForm] = useState({
    name: '', slug: '', description: '', category: 'General',
    latitude: '', longitude: '', mapsUrl: '', imageUrl: '', isActive: true,
  })
  const [slugManual, setSlugManual] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (location) {
      setForm({
        name: location.name, slug: location.slug,
        description: location.description || '', category: location.category,
        latitude: location.latitude?.toString() || '', longitude: location.longitude?.toString() || '',
        mapsUrl: location.mapsUrl || '', imageUrl: location.imageUrl || '', isActive: location.isActive,
      })
      setSlugManual(true)
    }
  }, [location])

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) { setForm(f => ({ ...f, [k]: v })) }

  function handleNameChange(v: string) {
    setForm(f => ({ ...f, name: v, ...(!slugManual ? { slug: slugify(v) } : {}) }))
  }

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to upload image')
        setUploadingImage(false)
        return
      }

      set('imageUrl', data.url)
    } catch {
      setError('Network error during image upload')
    }
    setUploadingImage(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    const payload = {
      ...form,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
    }
    try {
      const res = await fetch(isEdit ? `/api/locations/${location!.id}` : '/api/locations', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Something went wrong'); setLoading(false); return }
      onSuccess()
    } catch { setError('Network error. Please try again.'); setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? '✏️ Edit Location / Building' : '➕ Add Building / Location'}</h2>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="loc-name">Building / Location Name <span className="required">*</span></label>
              <input id="loc-name" type="text" className="form-input" placeholder="e.g. Central Library"
                value={form.name} onChange={e => handleNameChange(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="loc-slug">URL Slug <span className="required">*</span></label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)',
                  color:'var(--text-3)', fontSize:'var(--text-sm)', pointerEvents:'none' }}>/location/</span>
                <input id="loc-slug" type="text" className="form-input"
                  style={{ paddingLeft:86, fontFamily:'monospace' }}
                  placeholder="library"
                  value={form.slug}
                  onChange={e => { setSlugManual(true); set('slug', slugify(e.target.value)) }}
                  required />
              </div>
              <div className="form-hint">
                ⚠️ Permanent QR identifier. Do not alter after printing QR.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="loc-cat">Category</label>
              <select id="loc-cat" className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="loc-desc">Building Description</label>
              <textarea id="loc-desc" className="form-textarea" placeholder="Brief details, floors, facilities available..."
                value={form.description} onChange={e => set('description', e.target.value)} />
            </div>

            {/* Building Photo Upload */}
            <div className="form-group" style={{ background: 'var(--bg-3)', padding: 14, borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <label className="form-label">📸 Building Photo / Image</label>

              {form.imageUrl && (
                <div style={{ marginBottom: 12, borderRadius: 'var(--r-sm)', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.imageUrl} alt="Building preview" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    style={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={() => set('imageUrl', '')}
                  >
                    🗑️ Remove Photo
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {uploadingImage ? '⏳ Uploading...' : '📁 Upload Photo from Desktop'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploadingImage} />
                </label>
                {form.imageUrl && (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--green)' }}>✓ Photo attached</span>
                )}
              </div>
            </div>

            <div className="form-row" style={{ marginTop: 12 }}>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label" htmlFor="loc-lat">Latitude</label>
                <input id="loc-lat" type="number" step="any" className="form-input"
                  placeholder="e.g. 12.9716" value={form.latitude} onChange={e => set('latitude', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label" htmlFor="loc-lng">Longitude</label>
                <input id="loc-lng" type="number" step="any" className="form-input"
                  placeholder="e.g. 77.5946" value={form.longitude} onChange={e => set('longitude', e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="form-label" htmlFor="loc-maps">Google Maps Link</label>
              <input id="loc-maps" type="url" className="form-input"
                placeholder="https://maps.google.com/?q=..."
                value={form.mapsUrl} onChange={e => set('mapsUrl', e.target.value)} />
            </div>

            <div className="form-toggle">
              <div>
                <div style={{ fontWeight:600, fontSize:'var(--text-sm)', color:'var(--text-1)' }}>Active Status</div>
                <div style={{ fontSize:'var(--text-xs)', color:'var(--text-3)' }}>Inactive buildings are hidden from public view</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || uploadingImage}>
              {loading ? '⏳ Saving…' : isEdit ? '💾 Save Changes' : '✅ Create Building'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
