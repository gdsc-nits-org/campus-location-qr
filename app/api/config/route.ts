import { NextRequest, NextResponse } from 'next/server'
import { getLocalIpAddress, resolveBaseUrl } from '@/lib/get-base-url'

export async function GET(req: NextRequest) {
  const localIp = getLocalIpAddress()
  const defaultBaseUrl = resolveBaseUrl(req)

  return NextResponse.json({
    localIp,
    defaultBaseUrl,
    envBaseUrl: process.env.NEXT_PUBLIC_BASE_URL || null,
  })
}
