import { createClient } from "@supabase/supabase-js"
import { getSupabaseSecretKey } from "./config"

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = getSupabaseSecretKey()
  if (!url || !key) throw new Error("Supabase admin configuration is missing")
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}
