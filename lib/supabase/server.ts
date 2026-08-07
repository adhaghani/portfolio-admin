import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""

let warnedMissingServiceKey = false

/**
 * Server-side client — only usable in Server Components / Route Handlers.
 * Uses the service-role key for full database access.
 *
 * ⚠️  NEVER expose this key to the browser.
 */
export function getServerClient() {
  if (!supabaseServiceKey && !warnedMissingServiceKey) {
    warnedMissingServiceKey = true
    console.warn(
      "[Supabase] SUPABASE_SERVICE_ROLE_KEY is not set. " +
        "Server-side calls will fail. Add it to your .env.local file. " +
        "See .env.example for required variables.",
    )
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })
}
