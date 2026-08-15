import os from 'os'
import { NextRequest } from 'next/server'

export function getLocalIpAddress(): string {
  try {
    const interfaces = os.networkInterfaces()
    const candidates: { name: string; address: string }[] = []

    for (const name of Object.keys(interfaces)) {
      const lower = name.toLowerCase()
      // Skip virtual adapters like WSL, Hyper-V, VirtualBox, VMware, Docker, Tailscale
      if (
        lower.includes('vethernet') ||
        lower.includes('wsl') ||
        lower.includes('virtual') ||
        lower.includes('hyper-v') ||
        lower.includes('docker') ||
        lower.includes('vmware') ||
        lower.includes('tailscale') ||
        lower.includes('loopback') ||
        lower.includes('bluetooth')
      ) {
        continue
      }

      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          candidates.push({ name, address: iface.address })
        }
      }
    }

    // 1. Prefer Wi-Fi / Wireless / WLAN interfaces
    const wifi = candidates.find(c => {
      const l = c.name.toLowerCase()
      return l.includes('wi-fi') || l.includes('wifi') || l.includes('wireless') || l.includes('wlan')
    })
    if (wifi) return wifi.address

    // 2. Prefer standard local subnet (192.168.x.x or 10.x.x.x)
    const localSubnet = candidates.find(c => c.address.startsWith('192.168.') || c.address.startsWith('10.'))
    if (localSubnet) return localSubnet.address

    // 3. Any remaining valid candidate
    if (candidates.length > 0) return candidates[0].address
  } catch (e) {
    console.error('Failed to get network interfaces', e)
  }
  return '192.168.31.72'
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
