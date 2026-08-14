'use client'

import { useState, FormEvent } from 'react'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function AdminUserModal({ onClose, onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'SUPER_ADMIN'>('ADMIN')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password, role }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create user')
        setLoading(false)
        return
      }

      onSuccess()
    } catch {
      setError('Network error')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <h2>👤 Grant Admin Access</h2>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="user-email">Admin Email <span className="required">*</span></label>
              <input
                id="user-email"
                type="email"
                className="form-input"
                placeholder="colleague@campus.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-name">Full Name</label>
              <input
                id="user-name"
                type="text"
                className="form-input"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-pass">Initial Password <span className="required">*</span></label>
              <input
                id="user-pass"
                type="text"
                className="form-input"
                placeholder="Set password (min 6 chars)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <div className="form-hint">Provide this password to the new admin so they can sign in.</div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-role">Role / Access Level</label>
              <select
                id="user-role"
                className="form-select"
                value={role}
                onChange={e => setRole(e.target.value as 'ADMIN' | 'SUPER_ADMIN')}
              >
                <option value="ADMIN">Admin (Manage Locations & QRs)</option>
                <option value="SUPER_ADMIN">Super Admin (Full Power & Manage Other Admins)</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Creating...' : '✅ Create Admin Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
