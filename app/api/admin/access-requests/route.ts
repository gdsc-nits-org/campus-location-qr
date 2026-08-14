import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: List all access requests (admin + super admin)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const requests = await prisma.accessRequest.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(requests)
}

// POST: Submit a new access request (public)
export async function POST(req: NextRequest) {
  try {
    const { name, email, department, reason } = await req.json()
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Check not already an admin
    const existing = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'This email already has admin access.' }, { status: 400 })
    }

    // Check no pending request
    const pending = await prisma.accessRequest.findFirst({
      where: { email: email.toLowerCase(), status: 'PENDING' }
    })
    if (pending) {
      return NextResponse.json({ error: 'A pending request already exists for this email.' }, { status: 400 })
    }

    const request = await prisma.accessRequest.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        department: department?.trim() || null,
        reason: reason?.trim() || null,
      }
    })
    return NextResponse.json(request, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to submit request' }, { status: 500 })
  }
}
