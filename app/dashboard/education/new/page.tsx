"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createEducationEntry } from "@/lib/admin/education"
import { EducationForm } from "@/components/education/education-form"
import { getErrorMessage } from "@/lib/error-utils"
import type { EducationFormValues } from "@/lib/validations"

export default function NewEducationPage() {
  const router = useRouter()
  async function handleSubmit(values: EducationFormValues) {
    try {
      await createEducationEntry(values)
      toast.success("Education entry created")
      router.push("/dashboard/education")
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create entry"))
    }
  }
  return <EducationForm onSubmit={handleSubmit} submitLabel="Create entry" />
}
