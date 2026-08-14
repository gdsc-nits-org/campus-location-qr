import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

const ICONS: Record<string, string> = {
  Academic: '🎓',
  Hostel: '🏠',
  Administration: '🏛️',
  Food: '🍽️',
  Sports: '⚽',
  Healthcare: '🏥',
  Events: '🎭',
  Innovation: '🚀',
  Infrastructure: '🚪',
  General: '📍',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const loc = await prisma.location.findUnique({ where: { slug } })
  if (!loc) return { title: 'Location Not Found — Campus Navigator' }
  return {
    title: `${loc.name} — Campus Navigator`,
    description: loc.description || `Find ${loc.name} on campus`,
  }
}

export default async function LocationPage({ params }: Props) {
  const { slug } = await params
  const loc = await prisma.location.findUnique({ where: { slug } })

  if (!loc) {
    return (
      <div className="location-page">
        <Navbar />
        <div style={{ display: 'grid', placeItems: 'center', minHeight: '65vh', padding: '40px 24px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🔍</div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: '8px' }}>Building / Location Not Found</h1>
            <p style={{ color: 'var(--text-2)', marginBottom: '24px' }}>This QR code points to a location that is not registered in the system yet.</p>
            <Link href="/" className="btn btn-primary">← View Directory</Link>
          </div>
        </div>
      </div>
    )
  }

  if (!loc.isActive) {
    return (
      <div className="location-page">
        <Navbar />
        <div style={{ display: 'grid', placeItems: 'center', minHeight: '65vh', padding: '40px 24px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🚧</div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: '8px' }}>Temporarily Unavailable</h1>
            <p style={{ color: 'var(--text-2)', marginBottom: '24px' }}>This location is currently inactive. Please check back later.</p>
            <Link href="/" className="btn btn-primary">← View Directory</Link>
          </div>
        </div>
      </div>
    )
  }

  // Redirect directly to Google Maps when QR is scanned
  const mapsLink = loc.mapsUrl || (loc.latitude && loc.longitude
    ? `https://maps.google.com/?q=${loc.latitude},${loc.longitude}` : null)
  if (mapsLink) {
    redirect(mapsLink)
  }

  const icon = ICONS[loc.category] || '📍'
  const badgeClass = `badge badge-${loc.category.toLowerCase().replace(/\s+/g, '-')}`
  const mapSrc = loc.latitude && loc.longitude
    ? `https://maps.google.com/maps?q=${loc.latitude},${loc.longitude}&z=17&output=embed`
    : null
  const updatedAt = new Date(loc.updatedAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="location-page">
      <Navbar />

      <div className="location-hero">
        <div className="location-hero-inner">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Directory</Link>
            <span>›</span>
            <span>{loc.name}</span>
          </nav>
          <span className="location-emoji">{icon}</span>
          <h1>{loc.name}</h1>
          <div className="location-meta">
            <span className={badgeClass}>{loc.category}</span>
            <span>·</span>
            <span>Updated {updatedAt}</span>
          </div>
        </div>
      </div>

      <div className="location-content">
        {loc.imageUrl && (
          <div style={{ marginBottom: 20, borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={loc.imageUrl} alt={loc.name} style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }} />
          </div>
        )}

        {loc.description && (
          <div className="location-description-card">
            <h2>About this location</h2>
            <p>{loc.description}</p>
          </div>
        )}

        <div className="map-card">
          <div className="map-card-header">
            <h2>📍 Location on Map</h2>
            {loc.latitude && loc.longitude && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', fontFamily: 'monospace' }}>
                {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
              </span>
            )}
          </div>
          {mapSrc ? (
            <iframe
              className="map-iframe"
              src={mapSrc}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map for ${loc.name}`}
            />
          ) : (
            <div className="location-no-map">
              <span style={{ fontSize: '2rem' }}>🗺️</span>
              <span>Map not configured yet</span>
            </div>
          )}
          {mapsLink && (
            <div className="maps-cta">
              <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-full btn-lg">
                🗺️ Open in Google Maps
              </a>
            </div>
          )}
        </div>

        <div className="info-box" style={{ marginBottom: 20 }}>
          <span className="info-box-icon">🔗</span>
          <div>
            <div className="info-box-title">Permanent QR Code Location</div>
            The physical QR code at this location never needs replacing. If details change, administrators update them in the admin dashboard.
          </div>
        </div>

        <Link href="/" className="btn btn-secondary">← Back to Directory</Link>
      </div>

      <footer className="site-footer">
        Campus Navigator · Building Directory
      </footer>
    </div>
  )
}
