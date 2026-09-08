import { NextResponse } from "next/server"
import { z } from "zod"
import { authenticate, SESSION_COOKIE } from "@/lib/auth"

export const runtime = "nodejs"
const schema = z.object({ email: z.string().email(), password: z.string().min(8).max(200) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 })
  const result = await authenticate(parsed.data.email, parsed.data.password)
  if (!result) return NextResponse.json({ error: "The email or password is not correct." }, { status: 401 })
  const response = NextResponse.json({ user: result.user })
  response.cookies.set(SESSION_COOKIE, result.token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 })
  return response
}
