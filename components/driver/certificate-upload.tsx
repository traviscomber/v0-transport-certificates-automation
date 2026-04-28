"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface CertificateUploadProps {
  onClose: () => void
  onSuccess: () => void
}

export function CertificateUpload({ onClose, onSuccess }: CertificateUploadProps) {
  const [formData, setFormData] = useState({
    certificate_type: "",
    certificate_number: "",
    issue_date: "",
    expiry_date: "",
    issuing_authority: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const certificateTypes = [
    { value: "f30", label: "Certificado F-30" },
    { value: "license", label: "Licencia de Conducir" },
    { value: "medical", label: "Certificado Médico" },
    { value: "vehicle_registration", label: "Registro Vehicular" },
    { value: "insurance", label: "Seguro" },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Solo se permiten archivos PDF, JPG, JPEG o PNG")
        return
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("El archivo no puede ser mayor a 10MB")
        return
      }

      setFile(selectedFile)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError("Por favor selecciona un archivo")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuario no autenticado")

      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("certificates").getPublicUrl(fileName)

      // Insert certificate record
      const { error: insertError } = await (supabase as any).from("certificates").insert({
        driver_id: user.id,
        certificate_type: formData.certificate_type,
        certificate_number: formData.certificate_number,
        issue_date: formData.issue_date,
        expiry_date: formData.expiry_date,
        issuing_authority: formData.issuing_authority,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        status: "pending",
      })

      if (insertError) throw insertError

      onSuccess()
    } catch (error: any) {
      setError(error.message || "Error al subir el certificado")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Subir Certificado</DialogTitle>
          <DialogDescription>
            Completa la información del certificado y sube el archivo correspondiente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="certificate_type">Tipo de Certificado</Label>
            <Select
              value={formData.certificate_type}
              onValueChange={(value) => setFormData({ ...formData, certificate_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de certificado" />
              </SelectTrigger>
              <SelectContent>
                {certificateTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificate_number">Número de Certificado</Label>
            <Input
              id="certificate_number"
              value={formData.certificate_number}
              onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
              placeholder="Ej: F30-123456"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issue_date">Fecha de Emisión</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry_date">Fecha de Vencimiento</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="issuing_authority">Autoridad Emisora</Label>
            <Input
              id="issuing_authority"
              value={formData.issuing_authority}
              onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value })}
              placeholder="Ej: Ministerio de Transportes"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Archivo del Certificado</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <input
                id="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                {file ? (
                  <>
                    <FileText className="h-8 w-8 text-primary" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium">Haz clic para subir archivo</span>
                    <span className="text-xs text-muted-foreground">PDF, JPG, JPEG o PNG (máx. 10MB)</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !file}>
              {isLoading ? "Subiendo..." : "Subir Certificado"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
