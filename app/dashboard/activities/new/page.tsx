"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createActivity } from "@/lib/admin/activities"
import { ActivityForm } from "@/components/activities/activity-form"
import type { ActivityFormValues } from "@/lib/validations"

export default function NewActivityPage() {
  const router = useRouter()
  async function handleSubmit(values: ActivityFormValues) {
    try {
      await createActivity(values)
      toast.success("Activity created")
      router.push("/dashboard/activities")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create activity")
    }
  }
  return <ActivityForm onSubmit={handleSubmit} submitLabel="Create activity" />
}
