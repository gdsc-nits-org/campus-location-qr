import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 })
    }

    const userId = (session.user as any).id
    const user = await prisma.adminUser.findUnique({ where: { id: userId } })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 })
    }

    const newHash = await bcrypt.hash(newPassword, 12)
    await prisma.adminUser.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    })

    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to change password' }, { status: 500 })
  }
}
