"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createCertificate } from "@/lib/admin/certificates"
import { CertificateForm } from "@/components/certificates/certificate-form"
import { getErrorMessage } from "@/lib/error-utils"
import type { CertificateFormValues } from "@/lib/validations"

export default function NewCertificatePage() {
  const router = useRouter()
  async function handleSubmit(values: CertificateFormValues) {
    try {
      await createCertificate(values)
      toast.success("Certificate created")
      router.push("/dashboard/certificates")
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create certificate"))
    }
  }
  return <CertificateForm onSubmit={handleSubmit} submitLabel="Create certificate" />
}
