'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'

export default function AdminSignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/access-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          department: department.trim() || undefined,
          reason: reason.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to submit access request')
        setLoading(false)
        return
      }

      setSubmitted(true)
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-box" style={{ maxWidth: 460 }}>
        <div className="login-logo">
          <div className="logo-icon">✍️</div>
          <h1>Request Admin Access</h1>
          <p>Sign up to receive management access for campus buildings</p>
        </div>

        {submitted ? (
          <div className="alert alert-success" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              ✅ Access Request Submitted!
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 16 }}>
              Your request for <strong>{email}</strong> has been routed to the Super Admin dashboard. Once approved and assigned your password, you will be able to log in.
            </p>
            <Link href="/admin/login" className="btn btn-primary btn-full">
              🔑 Go to Admin Login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="alert alert-error" style={{ fontSize: 'var(--text-sm)', marginBottom: 16 }}>
                ⚠️ {error}
              </div>
            )}

            <div className="info-box" style={{ marginBottom: 18 }}>
              <span className="info-box-icon">ℹ️</span>
              <div>
                <strong>Role-Based Approval:</strong> Only authorized personnel will be granted admin access by the Super Admin (<code>84agarwalharshit@gmail.com</code>).
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="signup-name">Full Name <span className="required">*</span></label>
                <input
                  id="signup-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-email">Official Campus Email <span className="required">*</span></label>
                <input
                  id="signup-email"
                  type="email"
                  className="form-input"
                  placeholder="e.g. rajesh.k@campus.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-dept">Department / Faculty</label>
                <input
                  id="signup-dept"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Department of Computer Science / Facilities"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-reason">Reason for Admin Access</label>
                <textarea
                  id="signup-reason"
                  className="form-textarea"
                  placeholder="e.g. Need to update building information, upload photos, and generate physical QR codes for our department."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
                style={{ marginTop: 12, fontWeight: 700 }}
              >
                {loading ? '⏳ Submitting Request...' : '📩 Submit Admin Request (Sign Up)'}
              </button>
            </form>

            <div style={{
              marginTop: 24,
              padding: '12px',
              background: 'var(--bg-3)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              textAlign: 'center',
              fontSize: 'var(--text-sm)'
            }}>
              <span style={{ color: 'var(--text-2)' }}>Already have admin access?</span>{' '}
              <Link href="/admin/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                Log in here →
              </Link>
            </div>
          </>
        )}

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', textDecoration: 'underline' }}>
            ← Return to Public Campus Map & Directory
          </Link>
        </div>
      </div>
    </div>
  )
}
