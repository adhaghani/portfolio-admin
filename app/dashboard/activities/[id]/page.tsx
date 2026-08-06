"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { getActivity, updateActivity, type ActivityUpdateInput } from "@/lib/admin/activities"
import { ActivityForm } from "@/components/activities/activity-form"
import type { ActivityFormValues } from "@/lib/validations"

type ActivityRow = ActivityUpdateInput & { id: string; created_at: string }

export default function EditActivityPage() {
  const params = useParams()
  const router = useRouter()
  const [activity, setActivity] = useState<ActivityRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getActivity(params.id as string)
      .then((data) => setActivity(data as ActivityRow))
      .catch(() => { toast.error("Activity not found"); router.push("/dashboard/activities") })
      .finally(() => setLoading(false))
  }, [params.id, router])

  async function handleSubmit(values: ActivityFormValues) {
    if (!activity) return
    await updateActivity(activity.id, values)
    toast.success("Activity updated")
  }

  if (loading) return null
  if (!activity) return null

  return <ActivityForm initialValues={activity} onSubmit={handleSubmit} submitLabel="Save changes" isEditing />
}
