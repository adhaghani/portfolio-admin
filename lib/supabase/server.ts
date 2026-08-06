import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""

/**
 * Server-side client — only usable in Server Components / Route Handlers.
 * Uses the service-role key for full database access.
 *
 * ⚠️  NEVER expose this key to the browser.
 */
export function getServerClient() {
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })
}
