import { getBrowserClient } from "@/lib/supabase/client"

export async function listFiles(bucket: string, folder?: string) {
  const supabase = getBrowserClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder ?? "", { sortBy: { column: "created_at", order: "desc" } })
  if (error) throw error
  return data
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
) {
  const supabase = getBrowserClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file)
  if (error) throw error
  return data
}

export async function deleteFiles(bucket: string, paths: string[]) {
  const supabase = getBrowserClient()
  const { error } = await supabase.storage.from(bucket).remove(paths)
  if (error) throw error
}

export function getPublicUrl(bucket: string, path: string): string {
  const supabase = getBrowserClient()
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}
