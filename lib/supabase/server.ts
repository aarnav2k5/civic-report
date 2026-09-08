import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabasePublicConfig } from "./config"

export function createSupabaseServerClient() {
  const config = getSupabasePublicConfig()
  if (!config) throw new Error("Supabase public configuration is missing")
  const cookieStore = cookies()
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch { /* Route handlers can write cookies; server components cannot. */ } },
    },
  })
}
