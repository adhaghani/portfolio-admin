"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { getCertificate, updateCertificate, type CertificateUpdateInput } from "@/lib/admin/certificates"
import { CertificateForm } from "@/components/certificates/certificate-form"
import type { CertificateFormValues } from "@/lib/validations"

type CertificateRow = CertificateUpdateInput & { id: string }

export default function EditCertificatePage() {
  const params = useParams()
  const router = useRouter()
  const [cert, setCert] = useState<CertificateRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCertificate(params.slug as string)
      .then((data) => setCert(data as CertificateRow))
      .catch(() => { toast.error("Certificate not found"); router.push("/dashboard/certificates") })
      .finally(() => setLoading(false))
  }, [params.slug, router])

  async function handleSubmit(values: CertificateFormValues) {
    if (!cert) return
    await updateCertificate(cert.id, values)
  }

  if (loading) return null
  if (!cert) return null

  return <CertificateForm initialValues={cert} onSubmit={handleSubmit} submitLabel="Save changes" />
}
