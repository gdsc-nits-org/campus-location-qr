import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const loc = await prisma.location.findUnique({ where: { slug } })

  if (!loc || !loc.isActive) {
    // Fallback: redirect to public directory
    return NextResponse.redirect(new URL('/', _req.url), 302)
  }

  const mapsUrl =
    loc.mapsUrl ||
    (loc.latitude && loc.longitude
      ? `https://maps.google.com/?q=${loc.latitude},${loc.longitude}`
      : null)

  if (mapsUrl) {
    // Hard 302 redirect directly to Google Maps
    return NextResponse.redirect(mapsUrl, 302)
  }

  // No map data — fallback to location info page
  return NextResponse.redirect(new URL(`/location/${slug}`, _req.url), 302)
}
