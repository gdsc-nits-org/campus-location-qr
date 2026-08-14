import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const users = await prisma.adminUser.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const callerRole = (session?.user as any)?.role
  if (!session?.user || !callerRole) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { email, name, password, role } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const existing = await prisma.adminUser.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'An admin user with this email already exists' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const newUser = await prisma.adminUser.create({
      data: {
        email: email.trim().toLowerCase(),
        name: name?.trim() || null,
        passwordHash,
        role: role === 'SUPER_ADMIN' && callerRole === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to create user' }, { status: 500 })
  }
}
