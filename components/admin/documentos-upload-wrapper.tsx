"use client"

import { useRouter } from "next/navigation"
import { DocumentosUpload } from "./documentos-upload"

interface Conductor {
  id: string
  nombres: string
  apellido_paterno: string
  rut: string
}

export function DocumentosUploadWrapper({ conductores }: { conductores: Conductor[] }) {
  const router = useRouter()

  const handleUploadSuccess = () => {
    console.log('[v0] Upload successful, refreshing page...')
    // Refresh the page to show new documents
    router.refresh()
  }

  return <DocumentosUpload conductores={conductores} onUploadSuccess={handleUploadSuccess} />
}
