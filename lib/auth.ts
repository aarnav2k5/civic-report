import { createSupabaseServerClient } from "./supabase/server"
import type { User } from "./types"

function roleFor(email: string | undefined, metadata: Record<string, unknown>): User["role"] {
  const role = metadata.role
  if (role === "admin" || role === "staff" || role === "citizen") return role
  if (email && process.env.CIVIC_ADMIN_EMAIL && email.toLowerCase() === process.env.CIVIC_ADMIN_EMAIL.toLowerCase()) return "admin"
  return "citizen"
}

export async function authenticate(email: string, password: string) {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) return null
  return { user: publicUser(data.user) }
}

export async function currentUser() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ? publicUser(user) : null
}

export async function signOut() { await createSupabaseServerClient().auth.signOut() }

export function publicUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> }): User {
  const metadata = user.user_metadata || {}
  const accessMetadata = user.app_metadata || {}
  return { id: user.id, name: typeof metadata.full_name === "string" ? metadata.full_name : user.email || "CivicReport user", email: user.email || "", role: roleFor(user.email, accessMetadata), department: typeof metadata.department === "string" ? metadata.department : undefined }
}

export async function requireRole(roles: User["role"][]) {
  const user = await currentUser()
  if (!user || !roles.includes(user.role)) return null
  return user
}
