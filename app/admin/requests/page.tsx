'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminSidebar from '@/components/AdminSidebar'
import ApproveRequestModal from '@/components/ApproveRequestModal'
import ChangePasswordModal from '@/components/ChangePasswordModal'

interface AccessRequest {
  id: string
  name: string
  email: string
  department: string | null
  reason: string | null
  status: string
  grantedBy: string | null
  createdAt: string
}

export default function AdminRequestsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING')
  const [selected, setSelected] = useState<AccessRequest | null>(null)
  const [showPassModal, setShowPassModal] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const callerRole = (session?.user as any)?.role || ''

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/admin/login')
  }, [status, router])

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/access-requests')
      if (res.ok) setRequests(await res.json())
    } catch { showToast('error', 'Failed to load requests') }
    setLoading(false)
  }, [])

  useEffect(() => { if (status === 'authenticated') fetchRequests() }, [status, fetchRequests])

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  async function deleteRequest(id: string) {
    if (!confirm('Delete this request record permanently?')) return
    await fetch(`/api/admin/access-requests/${id}`, { method: 'DELETE' })
    fetchRequests()
    showToast('success', 'Request deleted')
  }

  const displayed = requests.filter(r => filter === 'ALL' ? true : r.status === filter)
  const pending = requests.filter(r => r.status === 'PENDING').length

  if (status === 'loading' || status === 'unauthenticated') {
    return <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', color: 'var(--text-3)' }}>Loading…</div>
  }

  return (
    <div className="admin-layout">
      <AdminSidebar active="requests" onChangePassword={() => setShowPassModal(true)} />

      <div className="admin-main">
        <div className="admin-topbar">
          <h1>📥 Access Requests</h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border)' }}>
              🏛️ Public Directory
            </Link>
            {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
                {f === 'PENDING' && pending > 0 ? `⏳ Pending (${pending})` :
                 f === 'APPROVED' ? '✅ Approved' :
                 f === 'REJECTED' ? '❌ Rejected' : '🗂️ All'}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-content">
          {toast && (
            <div className={`alert alert-${toast.type}`} style={{
              position: 'fixed', top: 70, right: 20, zIndex: 9999,
              minWidth: 260, boxShadow: 'var(--shadow-lg)', animation: 'slideUp .2s ease'
            }}>
              {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
            </div>
          )}

          <div className="info-box" style={{ marginBottom: 20 }}>
            <span className="info-box-icon">💡</span>
            <div>
              <div className="info-box-title">How it works</div>
              When someone clicks "Request Access" on the login page, their request appears here.
              Click <strong>Review</strong> to approve (set their password + role) or reject the request.
              Approved users can immediately sign in with the password you set.
            </div>
          </div>

          <div className="table-container">
            <div className="table-wrap">
              {loading ? (
                <div className="empty-state"><div className="empty-icon">⏳</div><h3>Loading requests…</h3></div>
              ) : displayed.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">{filter === 'PENDING' ? '🎉' : '📭'}</div>
                  <h3>{filter === 'PENDING' ? 'No pending requests!' : 'No requests found'}</h3>
                  <p>{filter === 'PENDING' ? 'All requests have been reviewed.' : 'Try a different filter.'}</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Requester</th>
                      <th>Department / Reason</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map(r => (
                      <tr key={r.id}>
                        <td>
                          <div className="location-name-cell">{r.name}</div>
                          <div className="location-slug-cell">{r.email}</div>
                        </td>
                        <td>
                          {r.department && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-2)', marginBottom: 2 }}>🏛️ {r.department}</div>}
                          {r.reason && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', fontStyle: 'italic', maxWidth: 260 }}>"{r.reason}"</div>}
                          {!r.department && !r.reason && <span style={{ color: 'var(--text-3)', fontSize: 'var(--text-xs)' }}>—</span>}
                        </td>
                        <td>
                          <span className={`badge ${
                            r.status === 'APPROVED' ? 'badge-active' :
                            r.status === 'REJECTED' ? 'badge-inactive' : ''
                          }`} style={r.status === 'PENDING' ? {
                            background: 'rgba(210,153,34,.15)', color: '#d2a22a',
                            border: '1px solid rgba(210,153,34,.25)'
                          } : {}}>
                            {r.status === 'PENDING' ? '⏳ Pending' :
                             r.status === 'APPROVED' ? '✅ Approved' : '❌ Rejected'}
                          </span>
                          {r.grantedBy && (
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', marginTop: 2 }}>by {r.grantedBy}</div>
                          )}
                        </td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                          {new Date(r.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td>
                          <div className="table-actions">
                            {r.status === 'PENDING' && (
                              <button className="btn btn-primary btn-sm" onClick={() => setSelected(r)}>
                                🔑 Review
                              </button>
                            )}
                            {callerRole === 'SUPER_ADMIN' && (
                              <button className="btn btn-danger btn-sm btn-icon" onClick={() => deleteRequest(r.id)} title="Delete record">🗑️</button>
                            )}
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

      {selected && (
        <ApproveRequestModal
          request={selected}
          callerRole={callerRole}
          onClose={() => setSelected(null)}
          onSuccess={msg => {
            setSelected(null)
            fetchRequests()
            showToast('success', msg)
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
