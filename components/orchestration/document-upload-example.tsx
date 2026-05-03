/**
 * Componente React para demostrar uso del sistema de orquestación
 */
'use client'

import { useOrchestration } from '@/lib/orchestration/practical-example'

export function DocumentUploadWithOrchestration() {
  const orchestration = useOrchestration()

  const handleDocumentUpload = async (file: File) => {
    // Subir documento
    const uploadedDoc = await uploadFile(file)

    // Emitir evento al sistema de orquestación
    orchestration.emitEvent(
      'document_uploaded',
      {
        fileName: file.name,
        fileSize: file.size,
        documentId: uploadedDoc.id,
        email: 'user@example.com',
      },
      {
        userId: 'user123',
        entityId: 'entity456',
        entityType: 'driver',
        entityName: 'Juan Pérez',
        timestamp: new Date(),
        metadata: { source: 'ui' },
      }
    )

    // Los módulos automáticamente:
    // 1. Analizan el documento
    // 2. Generan alertas si es necesario
    // 3. Crean notificaciones
    // 4. Registran patrones
    // 5. Hacen predicciones
  }

  return (
    <div>
      <input type="file" onChange={(e) => e.target.files && handleDocumentUpload(e.target.files[0])} />
    </div>
  )
}

async function uploadFile(file: File) {
  return { id: 'doc-' + Date.now() }
}
