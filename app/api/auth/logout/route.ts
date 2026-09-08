import { NextResponse } from "next/server"
import { SESSION_COOKIE, signOut } from "@/lib/auth"

export const runtime = "nodejs"
export async function POST() {
  await signOut()
  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, expires: new Date(0), path: "/" })
  return response
}
