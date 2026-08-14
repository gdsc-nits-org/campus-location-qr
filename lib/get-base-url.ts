import os from 'os'
import { NextRequest } from 'next/server'

export function getLocalIpAddress(): string {
  try {
    const interfaces = os.networkInterfaces()
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address
        }
      }
    }
  } catch (e) {
    console.error('Failed to get network interfaces', e)
  }
  return 'localhost'
}

export function resolveBaseUrl(req?: NextRequest): string {
  // 1. If explicit environment variable is set and not localhost/default
  const envUrl = process.env.NEXT_PUBLIC_BASE_URL
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/$/, '')
  }

  // 2. Check query param from request if passed (?baseUrl=...)
  if (req) {
    const queryBase = req.nextUrl.searchParams.get('baseUrl')
    if (queryBase) {
      return queryBase.replace(/\/$/, '')
    }

    // 3. Check Host header
    const hostHeader = req.headers.get('x-forwarded-host') || req.headers.get('host')
    if (hostHeader) {
      const proto = req.headers.get('x-forwarded-proto') || 'http'
      // If host header is localhost or 127.0.0.1, swap with LAN IP so phone scanning works!
      if (hostHeader.includes('localhost') || hostHeader.includes('127.0.0.1')) {
        const port = hostHeader.split(':')[1] || '3000'
        const ip = getLocalIpAddress()
        return `${proto}://${ip}:${port}`
      }
      return `${proto}://${hostHeader}`
    }
  }

  // 4. Fallback to LAN IP
  const ip = getLocalIpAddress()
  return `http://${ip}:3000`
}
