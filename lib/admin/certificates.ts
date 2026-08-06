import { getBrowserClient } from "@/lib/supabase/client"

export interface CertificateInsertInput {
  slug: string
  title: string
  issuer: string
  date: string
  description?: string | null
  url: string
  credential_id?: string | null
  sort_order?: number
}

export interface CertificateUpdateInput
  extends Partial<CertificateInsertInput> {}

export async function getCertificates() {
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .order("sort_order", { ascending: true })
  if (error) throw error
  return data
}

export async function getCertificate(slug: string) {
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("slug", slug)
    .single()
  if (error) throw error
  return data
}

export async function createCertificate(input: CertificateInsertInput) {
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("certificates")
    .insert(input as never)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCertificate(
  id: string,
  input: CertificateUpdateInput,
) {
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("certificates")
    .update(input as never)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCertificate(id: string) {
  const supabase = getBrowserClient()
  const { error } = await supabase.from("certificates").delete().eq("id", id)
  if (error) throw error
}
