'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
  const { data: session, status } = useSession()

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand">
          <div className="brand-icon">📍</div>
          <span>Campus Navigator</span>
        </Link>
        <div className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/" className="nav-link">
            Building Directory
          </Link>

          {status === 'authenticated' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link href="/admin" className="btn btn-primary btn-sm" style={{ gap: '6px', fontWeight: 600 }}>
                ⚡ Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className="btn btn-ghost btn-sm btn-icon"
                title={`Signed in as ${session?.user?.email} - Click to Sign out`}
                aria-label="Sign out"
              >
                🚪
              </button>
            </div>
          ) : (
            <Link href="/admin/login" className="btn btn-primary btn-sm" style={{ gap: '6px', fontWeight: 600 }}>
              🛡️ Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
