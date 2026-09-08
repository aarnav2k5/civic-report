import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/auth"
import { listUsers } from "@/lib/server-db"

export const runtime = "nodejs"
export async function GET(request: Request) {
  const user = await requireRole(["admin", "staff"])
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 })
  const role = new URL(request.url).searchParams.get("role")
  const parsed = z.enum(["citizen", "staff", "admin"]).safeParse(role || undefined)
  return NextResponse.json(await listUsers(parsed.success ? parsed.data : undefined))
}
