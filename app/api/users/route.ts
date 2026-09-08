import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/auth"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export async function GET(request: Request) {
  const user = await requireRole(["admin", "staff"])
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 })
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json([])
  const role = new URL(request.url).searchParams.get("role")
  const parsed = z.enum(["citizen", "staff", "admin"]).safeParse(role || undefined)
  const { data, error } = await createSupabaseAdminClient().auth.admin.listUsers({ perPage: 1000 })
  if (error) return NextResponse.json({ error: "Unable to load users." }, { status: 500 })
  return NextResponse.json(data.users.filter((user) => !parsed.success || user.app_metadata?.role === parsed.data).map((user) => ({ id: user.id, name: user.user_metadata?.full_name || user.email || "User", email: user.email || "", role: user.app_metadata?.role || "citizen", department: user.user_metadata?.department })))
}
