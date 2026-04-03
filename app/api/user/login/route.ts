import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export async function POST(req: Request) {
  const prisma = new PrismaClient()

  try {
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: 'JWT secret is not configured' },
        { status: 500 }
      )
    }

    const { username, password } = await req.json()
    const user = await prisma.user.findUnique({
      where: {
        name: username,
      },
    })
    if (!user) {
      return NextResponse.json(
        { statusText: 'Invalid username' },
        { status: 401 }
      )
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return NextResponse.json(
        { statusText: 'Invalid email or password' },
        { status: 401 }
      )
    }
    const { name, email } = user
    const token = jwt.sign({ name: user.name }, process.env.JWT_SECRET)
    const response = NextResponse.json(
      { user: { name, email } },
      { status: 200 }
    )

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })

    return response
  } catch (err) {
    return NextResponse.json({ error: 'login failed' }, { status: 500 })
  }
}
