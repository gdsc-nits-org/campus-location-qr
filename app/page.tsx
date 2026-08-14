'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface Location {
  id: string; slug: string; name: string; description: string | null
  category: string; latitude: number | null; longitude: number | null
  mapsUrl: string | null; imageUrl: string | null; isActive: boolean
}

const ICONS: Record<string, string> = {
  Academic:'🎓', Hostel:'🏠', Administration:'🏛️', Food:'🍽️',
  Sports:'⚽', Healthcare:'🏥', Events:'🎭', Innovation:'🚀',
  Infrastructure:'🚪', General:'📍',
}
const CATS = ['All','Academic','Hostel','Administration','Food','Sports','Healthcare','Events','Innovation','Infrastructure']

export default function HomePage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [filtered, setFiltered] = useState<Location[]>([])
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/locations')
      .then(r => r.json())
      .then(d => { setLocations(d); setFiltered(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const applyFilters = useCallback((q: string, c: string) => {
    let r = locations
    if (c !== 'All') r = r.filter(l => l.category === c)
    if (q.trim()) r = r.filter(l =>
      l.name.toLowerCase().includes(q.toLowerCase()) ||
      (l.description || '').toLowerCase().includes(q.toLowerCase())
    )
    setFiltered(r)
  }, [locations])

  useEffect(() => { applyFilters(search, cat) }, [search, cat, applyFilters])

  return (
    <>
      <Navbar />

      <section className="hero">
        <div className="hero-badge">📡 Campus Directory</div>
        <h1>Campus<br /><span className="gradient-text">Navigator</span></h1>
        <p>Explore campus buildings, hostels, auditoriums, and facilities with instant interactive map directions.</p>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="stat-num">{loading ? '—' : locations.length}</div>
            <div className="stat-label">Locations</div>
          </div>
          <div className="hero-stat">
            <div className="stat-num">{loading ? '—' : [...new Set(locations.map(l => l.category))].length}</div>
            <div className="stat-label">Categories</div>
          </div>
          <div className="hero-stat">
            <div className="stat-num">∞</div>
            <div className="stat-label">Live Directory</div>
          </div>
        </div>
      </section>

      <main style={{ padding: 'clamp(28px,5vw,48px) 0' }}>
        <div className="container">
          {/* Search */}
          <div style={{ marginBottom: 'var(--sp-4)' }}>
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="search"
                className="form-input"
                placeholder="Search campus buildings & locations…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search locations"
              />
            </div>
          </div>

          {/* Category filters */}
          <div className="category-filters" role="group" aria-label="Filter by category">
            {CATS.map(c => (
              <button
                key={c}
                className={`filter-btn${cat === c ? ' active' : ''}`}
                onClick={() => setCat(c)}
                aria-pressed={cat === c}
              >
                {c !== 'All' && ICONS[c]} {c}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="locations-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="location-card" style={{ pointerEvents: 'none' }}>
                  <div className="skeleton" style={{ height: 160, borderRadius: 0 }} />
                  <div style={{ padding: 16 }}>
                    <div className="skeleton" style={{ height: 14, width: '55%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 11, width: '90%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No buildings or locations found</h3>
              <p>Try a different search query or category filter</p>
            </div>
          ) : (
            <div className="locations-grid">
              {filtered.map(loc => (
                <Link key={loc.id} href={`/location/${loc.slug}`} className="location-card">
                  {loc.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={loc.imageUrl} alt={loc.name} className="location-card-image" loading="lazy" style={{ height: 160, objectFit: 'cover' }} />
                  ) : (
                    <div className="location-card-image-placeholder" style={{ height: 160 }}>{ICONS[loc.category] || '📍'}</div>
                  )}
                  <div className="location-card-body">
                    <div className="location-card-header">
                      <div className="location-name">{loc.name}</div>
                    </div>
                    {loc.description && (
                      <p className="location-description">{loc.description}</p>
                    )}
                    <div className="location-card-footer">
                      <span className={`badge badge-${loc.category.toLowerCase().replace(/\s+/g,'-')}`}>
                        {ICONS[loc.category]} {loc.category}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 600 }}>Directions →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="site-footer">
        Campus Navigator · Building Directory
      </footer>
    </>
  )
}
