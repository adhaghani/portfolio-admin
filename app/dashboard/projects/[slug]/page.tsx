"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { getProject, updateProject, type ProjectUpdateInput } from "@/lib/admin/projects"
import { ProjectForm } from "@/components/projects/project-form"
import type { ProjectFormValues } from "@/lib/validations"

type ProjectRow = ProjectUpdateInput & { id: string }

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<ProjectRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProject(params.slug as string)
      .then((data) => setProject(data as ProjectRow))
      .catch(() => { toast.error("Project not found"); router.push("/dashboard/projects") })
      .finally(() => setLoading(false))
  }, [params.slug, router])

  async function handleSubmit(values: ProjectFormValues) {
    if (!project) return
    await updateProject(project.id, values)
    toast.success("Project updated")
  }

  if (loading) return null
  if (!project) return null

  return <ProjectForm initialValues={project} onSubmit={handleSubmit} submitLabel="Save changes" isEditing />
}
