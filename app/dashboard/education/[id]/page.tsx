"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { getEducationEntry, updateEducationEntry, type EducationUpdateInput } from "@/lib/admin/education"
import { EducationForm } from "@/components/education/education-form"
import type { EducationFormValues } from "@/lib/validations"

type EducationRow = EducationUpdateInput & { id: string }

export default function EditEducationPage() {
  const params = useParams()
  const router = useRouter()
  const [entry, setEntry] = useState<EducationRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEducationEntry(params.id as string)
      .then((data) => setEntry(data as EducationRow))
      .catch(() => { toast.error("Entry not found"); router.push("/dashboard/education") })
      .finally(() => setLoading(false))
  }, [params.id, router])

  async function handleSubmit(values: EducationFormValues) {
    if (!entry) return
    await updateEducationEntry(entry.id, values)
  }

  if (loading) return null
  if (!entry) return null

  return <EducationForm initialValues={entry} onSubmit={handleSubmit} submitLabel="Save changes" />
}
