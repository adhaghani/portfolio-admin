import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

/**
 * Singleton browser client — created once per session.
 * Safe to call from any client component.
 */
let browserClient: ReturnType<typeof createClient<Database>> | null = null

export function getBrowserClient() {
  if (browserClient) return browserClient
  browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey)
  return browserClient
}
