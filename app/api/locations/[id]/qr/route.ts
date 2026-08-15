import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { resolveBaseUrl } from '@/lib/get-base-url'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const location = await prisma.location.findUnique({ where: { id } })
  if (!location) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const baseUrl = resolveBaseUrl(req)
  const url = `${baseUrl}/api/go/${location.slug}`

  const qrBuffer = await QRCode.toBuffer(url, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 512,
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  })

  return new NextResponse(new Uint8Array(qrBuffer), {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `inline; filename="qr-${location.slug}.png"`,
      'Cache-Control': 'no-cache',
    },
  })
}
