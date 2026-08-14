'use client'

import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const cleanEmail = email.trim().toLowerCase()

    try {
      const result = await signIn('credentials', {
        email: cleanEmail,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials. You do not have admin permission. Please request access from the Super Admin.')
        setLoading(false)
      } else if (result?.ok) {
        window.location.href = '/admin'
      } else {
        setError('Invalid credentials. You do not have admin permission.')
        setLoading(false)
      }
    } catch {
      setError('An unexpected error occurred during sign-in.')
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-box" style={{ maxWidth: 440 }}>
        <div className="login-logo">
          <div className="logo-icon">🔐</div>
          <h1>Admin Portal Login</h1>
          <p>Secure authentication for campus location managers</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ fontSize: 'var(--text-sm)', lineHeight: 1.5, marginBottom: '18px' }}>
            ⛔ <strong>Access Denied:</strong> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              className="form-input"
              placeholder="e.g. 84agarwalharshit@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-pass">Password</label>
            <input
              id="admin-pass"
              type="password"
              className="form-input"
              placeholder="Enter your admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: 12, fontWeight: 700 }}
          >
            {loading ? '⏳ Verifying Permissions...' : '🔓 Sign In to Dashboard'}
          </button>
        </form>

        <div style={{
          marginTop: 24,
          padding: '14px',
          background: 'var(--bg-3)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)',
          textAlign: 'center',
          fontSize: 'var(--text-sm)'
        }}>
          <span style={{ color: 'var(--text-2)' }}>Don&apos;t have admin permission yet?</span>
          <br />
          <Link href="/admin/signup" style={{ color: 'var(--accent)', fontWeight: 600, marginTop: 6, display: 'inline-block' }}>
            ✍️ Request Admin Access (Sign Up) →
          </Link>
        </div>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', textDecoration: 'underline' }}>
            ← Return to Public Campus Map & Directory
          </Link>
        </div>
      </div>
    </div>
  )
}
