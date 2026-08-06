// ---------------------------------------------------------------------------
// Certificates data layer — Supabase-first with static fallback
// ---------------------------------------------------------------------------

import { getServerClient } from "@/lib/supabase/server"
import type {
  Certificate,
  CertificateRow,
} from "@/lib/supabase/types"

export type { Certificate }

function transformRow(row: CertificateRow): Certificate {
  return {
    slug: row.slug,
    title: row.title,
    issuer: row.issuer,
    date: row.date,
    description: row.description ?? undefined,
    image: row.image ?? undefined,
    url: row.url,
    credentialId: row.credential_id ?? undefined,
  }
}

export async function getCertificates(): Promise<Certificate[]> {
  try {
    const supabase = getServerClient()

    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .order("sort_order", { ascending: true })

    if (error || !data) return []
    return (data as CertificateRow[]).map(transformRow)
  } catch {
    // fallback
  }

  try {
    const { getCertificates: staticGet } =
      await import("./certificates-static")
    return staticGet()
  } catch {
    return []
  }
}
