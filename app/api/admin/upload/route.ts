import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const ext = path.extname(file.name) || '.jpg'
    const fileName = `building-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`
    const filePath = path.join(uploadsDir, fileName)

    await writeFile(filePath, buffer)

    const publicUrl = `/uploads/${fileName}`

    return NextResponse.json({ url: publicUrl })
  } catch (e: any) {
    console.error('Image upload error:', e)
    return NextResponse.json({ error: 'Failed to save uploaded image' }, { status: 500 })
  }
}
