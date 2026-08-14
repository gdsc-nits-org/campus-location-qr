'use client'

import { useState, FormEvent } from 'react'

interface AccessRequest {
  id: string
  name: string
  email: string
  department: string | null
  reason: string | null
  status: string
  createdAt: string
}

interface Props {
  request: AccessRequest
  callerRole: string
  onClose: () => void
  onSuccess: (msg: string) => void
}

export default function ApproveRequestModal({ request, callerRole, onClose, onSuccess }: Props) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'SUPER_ADMIN'>('ADMIN')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!action) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/access-requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, password: action === 'approve' ? password : undefined, role }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); setLoading(false); return }
      onSuccess(data.message || (action === 'approve' ? 'Access granted!' : 'Request rejected'))
    } catch {
      setError('Network error')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <h2>🔑 Review Access Request</h2>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">⚠️ {error}</div>}

            {/* Request details */}
            <div style={{
              background: 'var(--bg-3)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              padding: '14px',
              marginBottom: '16px',
              display: 'grid',
              gap: '6px',
            }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-1)' }}>{request.name}</div>
              <div style={{ fontFamily: 'monospace', color: 'var(--accent)', fontSize: 'var(--text-sm)' }}>{request.email}</div>
              {request.department && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-2)' }}>🏛️ {request.department}</div>}
              {request.reason && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-2)', fontStyle: 'italic' }}>"{request.reason}"</div>}
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)' }}>
                Requested: {new Date(request.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>

            {/* Choose action */}
            {!action && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button type="button" className="btn btn-primary" onClick={() => setAction('approve')} style={{ padding: '12px', flexDirection: 'column', gap: 4 }}>
                  ✅ Grant Access
                </button>
                <button type="button" className="btn btn-danger" onClick={() => setAction('reject')} style={{ padding: '12px', flexDirection: 'column', gap: 4 }}>
                  ❌ Reject Request
                </button>
              </div>
            )}

            {action === 'reject' && (
              <div className="alert" style={{ background: 'rgba(248,81,73,.1)', border: '1px solid rgba(248,81,73,.3)', color: 'var(--text-1)' }}>
                ❌ You are about to <strong>reject</strong> the access request from <strong>{request.email}</strong>. They will not receive admin access.
              </div>
            )}

            {action === 'approve' && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="grant-pass">Set Initial Password <span className="required">*</span></label>
                  <input
                    id="grant-pass"
                    type="text"
                    className="form-input"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <div className="form-hint">Share this password with <strong>{request.email}</strong> so they can sign in.</div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="grant-role">Access Level</label>
                  <select
                    id="grant-role"
                    className="form-select"
                    value={role}
                    onChange={e => setRole(e.target.value as 'ADMIN' | 'SUPER_ADMIN')}
                  >
                    <option value="ADMIN">Admin — Manage locations, buildings, QR codes</option>
                    {callerRole === 'SUPER_ADMIN' && (
                      <option value="SUPER_ADMIN">Super Admin — Full access including user management</option>
                    )}
                  </select>
                </div>
              </>
            )}

            {action && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setAction(null); setError('') }}>
                ← Change Decision
              </button>
            )}
          </div>

          {action && (
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '⏳ Processing...' : action === 'approve' ? '✅ Confirm & Grant Access' : '❌ Confirm Rejection'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
