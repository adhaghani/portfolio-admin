import { getBrowserClient } from "@/lib/supabase/client"

export async function login(email: string, password: string) {
  const supabase = getBrowserClient()
  return supabase.auth.signInWithPassword({ email, password })
}

export async function logout() {
  const supabase = getBrowserClient()
  return supabase.auth.signOut()
}

export async function getSession() {
  const supabase = getBrowserClient()
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getUser() {
  const supabase = getBrowserClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}
