import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET all locations (admin: all; public: active only)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all') === 'true'
  const session = await getServerSession(authOptions)

  const locations = await prisma.location.findMany({
    where: all && session ? {} : { isActive: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(locations)
}

// POST create new location (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { slug, name, description, category, latitude, longitude, mapsUrl, imageUrl, isActive } = body

  if (!slug || !name) {
    return NextResponse.json({ error: 'slug and name are required' }, { status: 400 })
  }

  // Check slug uniqueness
  const existing = await prisma.location.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
  }

  const location = await prisma.location.create({
    data: {
      slug,
      name,
      description: description || null,
      category: category || 'General',
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      mapsUrl: mapsUrl || null,
      imageUrl: imageUrl || null,
      isActive: isActive !== undefined ? isActive : true,
    },
  })

  return NextResponse.json(location, { status: 201 })
}
