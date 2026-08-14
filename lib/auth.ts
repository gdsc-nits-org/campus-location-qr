import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const rawInput = credentials.email.trim()
        const normalizedEmail = rawInput.toLowerCase()

        // Find user by normalized email
        const user = await prisma.adminUser.findFirst({
          where: {
            OR: [
              { email: normalizedEmail },
              { email: rawInput },
            ],
          },
        })

        if (!user) {
          console.log(`[Auth] No user found for: ${normalizedEmail}`)
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) {
          console.log(`[Auth] Invalid password for: ${normalizedEmail}`)
          return null
        }

        return {
          id: user.id,
          name: user.name || user.email,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        session.user.email = token.email as string
      }
      return session
    },
  },
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  secret: process.env.NEXTAUTH_SECRET,
}
