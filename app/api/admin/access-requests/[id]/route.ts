import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// PATCH: Approve or reject a request — both ADMIN and SUPER_ADMIN can do this
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { action, password, role } = await req.json()
  // action: 'approve' | 'reject'

  const request = await prisma.accessRequest.findUnique({ where: { id } })
  if (!request) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }
  if (request.status !== 'PENDING') {
    return NextResponse.json({ error: 'This request has already been processed' }, { status: 400 })
  }

  if (action === 'approve') {
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Set a password of at least 6 characters for the new admin' }, { status: 400 })
    }

    // Check email not already registered
    const existing = await prisma.adminUser.findUnique({ where: { email: request.email } })
    if (existing) {
      // Mark as approved anyway
      await prisma.accessRequest.update({
        where: { id },
        data: { status: 'APPROVED', grantedBy: session.user.email || '' }
      })
      return NextResponse.json({ error: 'This email already has admin access' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    // Only SUPER_ADMIN can create SUPER_ADMIN role; ADMIN can only grant ADMIN role
    const grantedRole = role === 'SUPER_ADMIN' && (session.user as any).role === 'SUPER_ADMIN'
      ? 'SUPER_ADMIN'
      : 'ADMIN'

    await prisma.adminUser.create({
      data: {
        email: request.email,
        name: request.name,
        passwordHash,
        role: grantedRole,
      }
    })

    await prisma.accessRequest.update({
      where: { id },
      data: { status: 'APPROVED', grantedBy: session.user.email || '' }
    })

    return NextResponse.json({ success: true, message: `Admin access granted to ${request.email}` })
  }

  if (action === 'reject') {
    await prisma.accessRequest.update({
      where: { id },
      data: { status: 'REJECTED', grantedBy: session.user.email || '' }
    })
    return NextResponse.json({ success: true, message: `Request rejected` })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

// DELETE: Remove a request record (SUPER_ADMIN only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Only Super Admin can delete requests' }, { status: 403 })
  }
  const { id } = await params
  await prisma.accessRequest.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
