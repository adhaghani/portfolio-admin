// ---------------------------------------------------------------------------
// Static fallback — reads from content/certificates.ts
// Used when Supabase is not configured.
// ---------------------------------------------------------------------------

import { certificates, type Certificate } from "@/content/certificates"

export type { Certificate }

export function getCertificates(): Certificate[] {
  return certificates
}
