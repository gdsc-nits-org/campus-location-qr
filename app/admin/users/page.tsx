'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminSidebar from '@/components/AdminSidebar'
import AdminUserModal from '@/components/AdminUserModal'
import ChangePasswordModal from '@/components/ChangePasswordModal'

interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPassModal, setShowPassModal] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN'

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/admin/login')
  }, [status, router])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) setUsers(await res.json())
    } catch { showToast('error', 'Failed to load users') }
    setLoading(false)
  }, [])

  useEffect(() => { if (status === 'authenticated') fetchUsers() }, [status, fetchUsers])

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  async function deleteUser(user: AdminUser) {
    if (!confirm(`Revoke admin access for ${user.email}?`)) return
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        showToast('error', d.error || 'Failed to revoke access')
        return
      }
      showToast('success', `Access revoked for ${user.email}`)
      fetchUsers()
    } catch { showToast('error', 'Delete failed') }
  }

  if (status === 'loading' || status === 'unauthenticated') {
    return <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', color: 'var(--text-3)' }}>Loading…</div>
  }

  return (
    <div className="admin-layout">
      <AdminSidebar active="users" onChangePassword={() => setShowPassModal(true)} />

      <div className="admin-main">
        <div className="admin-topbar">
          <h1>👥 Admin User Management</h1>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border)' }}>
              🏛️ View Public Directory
            </Link>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowPassModal(true)}>
              🔒 My Password
            </button>
            {isSuperAdmin && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
                + Grant Admin Access
              </button>
            )}
          </div>
        </div>

        <div className="admin-content">
          {toast && (
            <div className={`alert alert-${toast.type}`} style={{
              position: 'fixed', top: '70px', right: '20px', zIndex: 9999,
              minWidth: '260px', maxWidth: '320px', animation: 'slideUp .2s ease', boxShadow: 'var(--shadow-lg)'
            }}>
              {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
            </div>
          )}

          <div className="info-box" style={{ marginBottom: 20 }}>
            <span className="info-box-icon">👑</span>
            <div>
              <div className="info-box-title">Super Admin Authority</div>
              As Super Admin, you can grant admin access to colleagues, manage roles, or revoke access. Admins can also approve access requests from the <strong>Access Requests</strong> page.
            </div>
          </div>

          <div className="table-container">
            <div className="table-toolbar">
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                Active Administrators ({users.length})
              </div>
            </div>

            <div className="table-wrap">
              {loading ? (
                <div className="empty-state"><div className="empty-icon">⏳</div><h3>Loading administrators...</h3></div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Added</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => {
                      const isSelf = u.id === (session?.user as any)?.id
                      return (
                        <tr key={u.id}>
                          <td>
                            <div className="location-name-cell">{u.name || '—'}</div>
                            {isSelf && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--green)', fontWeight: 600 }}>● You</span>}
                          </td>
                          <td style={{ fontFamily: 'monospace', color: 'var(--text-1)', fontSize: 'var(--text-sm)' }}>
                            {u.email}
                          </td>
                          <td>
                            <span className={`badge ${u.role === 'SUPER_ADMIN' ? 'badge-innovation' : 'badge-academic'}`}>
                              {u.role === 'SUPER_ADMIN' ? '👑 Super Admin' : '👤 Admin'}
                            </span>
                          </td>
                          <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)' }}>
                            {new Date(u.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td>
                            <div className="table-actions">
                              {isSelf && (
                                <button className="btn btn-ghost btn-sm" onClick={() => setShowPassModal(true)}>
                                  🔒 Password
                                </button>
                              )}
                              {isSuperAdmin && !isSelf && (
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => deleteUser(u)}
                                  title="Revoke access"
                                >
                                  🗑️ Revoke
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AdminUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            fetchUsers()
            showToast('success', 'Admin user created successfully')
          }}
        />
      )}

      {showPassModal && (
        <ChangePasswordModal
          onClose={() => setShowPassModal(false)}
          onSuccess={() => {
            setShowPassModal(false)
            showToast('success', 'Password changed successfully')
          }}
        />
      )}
    </div>
  )
}
