import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '40px 24px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🔍</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>Location Not Found</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', maxWidth: '400px' }}>
        This QR code may point to a location that hasn&apos;t been set up yet, or the URL may be incorrect.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" className="btn btn-primary">🏠 All Locations</Link>
        <Link href="/admin" className="btn btn-secondary">⚙️ Admin Panel</Link>
      </div>
    </div>
  )
}
