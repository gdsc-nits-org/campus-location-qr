import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Only Super Admin can delete admin users' }, { status: 403 })
  }

  const { id } = await params

  // Cannot delete self
  if (id === (session.user as any).id) {
    return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })
  }

  try {
    await prisma.adminUser.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
