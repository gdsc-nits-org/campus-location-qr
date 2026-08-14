import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET single location by id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const location = await prisma.location.findUnique({ where: { id } })
  if (!location) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(location)
}

// PUT update location (admin only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { name, description, category, latitude, longitude, mapsUrl, imageUrl, isActive } = body

  // If slug is changing, check uniqueness
  if (body.slug) {
    const existing = await prisma.location.findFirst({
      where: { slug: body.slug, NOT: { id } },
    })
    if (existing) return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
  }

  const location = await prisma.location.update({
    where: { id },
    data: {
      ...(body.slug && { slug: body.slug }),
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
      ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
      ...(mapsUrl !== undefined && { mapsUrl }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(isActive !== undefined && { isActive }),
    },
  })

  return NextResponse.json(location)
}

// DELETE location (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.location.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
