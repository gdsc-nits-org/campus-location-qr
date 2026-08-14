'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'

interface Props {
  active: 'locations' | 'qr-sheet' | 'requests' | 'users'
  onChangePassword?: () => void
}

export default function AdminSidebar({ active, onChangePassword }: Props) {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role || ''
  const [pending, setPending] = useState(0)

  useEffect(() => {
    fetch('/api/admin/access-requests')
      .then(r => r.json())
      .then((d: any[]) => setPending(d.filter(r => r.status === 'PENDING').length))
      .catch(() => {})
  }, [])

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        <div className="brand-icon">📡</div>
        <div>
          <div className="logo-text">Campus Nav</div>
          <div className="logo-sub">Admin Panel</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <Link className={`sidebar-nav-item${active === 'locations' ? ' active' : ''}`} href="/admin">
          <span className="nav-icon">📍</span> Locations
        </Link>
        <Link className={`sidebar-nav-item${active === 'qr-sheet' ? ' active' : ''}`} href="/admin/qr-sheet">
          <span className="nav-icon">📋</span> Print QR Sheet
        </Link>
        <Link
          className={`sidebar-nav-item${active === 'requests' ? ' active' : ''}`}
          href="/admin/requests"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <span><span className="nav-icon">📥</span> Access Requests</span>
          {pending > 0 && (
            <span style={{
              background: 'var(--red)', color: '#fff', borderRadius: '999px',
              fontSize: '0.65rem', padding: '1px 7px', fontWeight: 700, minWidth: 18, textAlign: 'center'
            }}>{pending}</span>
          )}
        </Link>
        <Link className={`sidebar-nav-item${active === 'users' ? ' active' : ''}`} href="/admin/users">
          <span className="nav-icon">👥</span> Admin Users
        </Link>
        <Link className="sidebar-nav-item" href="/" style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 10 }}>
          <span className="nav-icon">🏛️</span> Campus Directory
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', marginBottom: 8 }}>
          <strong style={{ color: 'var(--text-1)' }}>{session?.user?.email}</strong>
          <br />
          <span className={`badge ${role === 'SUPER_ADMIN' ? 'badge-innovation' : 'badge-academic'}`}
            style={{ fontSize: '0.65rem', marginTop: 2, display: 'inline-block' }}>
            {role === 'SUPER_ADMIN' ? '👑 Super Admin' : '👤 Admin'}
          </span>
        </div>
        {onChangePassword && (
          <button className="btn btn-ghost btn-sm btn-full" onClick={onChangePassword}>
            🔒 Change Password
          </button>
        )}
        <button
          className="btn btn-ghost btn-sm btn-full"
          style={{ marginTop: 4 }}
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
        >
          🚪 Sign Out
        </button>
      </div>
    </aside>
  )
}
