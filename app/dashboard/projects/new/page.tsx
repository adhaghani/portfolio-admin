"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createProject } from "@/lib/admin/projects"
import { ProjectForm } from "@/components/projects/project-form"
import type { ProjectFormValues } from "@/lib/validations"

export default function NewProjectPage() {
  const router = useRouter()

  async function handleSubmit(values: ProjectFormValues) {
    try {
      await createProject(values)
      toast.success("Project created")
      router.push("/dashboard/projects")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create project",
      )
    }
  }

  return <ProjectForm onSubmit={handleSubmit} submitLabel="Create project" />
}
