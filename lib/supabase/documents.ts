import { SupabaseClient } from '@supabase/supabase-js'

export interface DocumentMetadata {
  id?: string
  file_name: string
  file_size: number
  file_type: string
  document_type: string
  driver_id?: string
  subcontractor_id?: string
  storage_path?: string
  public_url?: string
  expiry_date?: string
  upload_date?: string
}

/**
 * Upload file to Supabase Storage and create document metadata
 */
export async function uploadDriverDocument(
  supabase: SupabaseClient,
  file: File,
  driverId: string,
  category: string
): Promise<DocumentMetadata | null> {
  try {
    const fileName = `${Date.now()}_${file.name}`
    const filePath = `drivers/${driverId}/${fileName}`

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    // Save metadata
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .insert({
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        document_type: category,
        driver_id: driverId,
        storage_path: filePath,
        public_url: publicUrl,
      })
      .select()
      .single()

    if (docError) throw docError

    return doc
  } catch (error) {
    console.error('[v0] Error uploading driver document:', error)
    return null
  }
}

/**
 * Upload file to Supabase Storage for subcontractor
 */
export async function uploadSubcontractorDocument(
  supabase: SupabaseClient,
  file: File,
  subcontractorId: string,
  category: string,
  expiryDate?: string
): Promise<DocumentMetadata | null> {
  try {
    const fileName = `${Date.now()}_${file.name}`
    const filePath = `subcontractors/${subcontractorId}/${fileName}`

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    // Save metadata
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .insert({
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        document_type: category,
        subcontractor_id: subcontractorId,
        storage_path: filePath,
        public_url: publicUrl,
        expiry_date: expiryDate || null,
      })
      .select()
      .single()

    if (docError) throw docError

    return doc
  } catch (error) {
    console.error('[v0] Error uploading subcontractor document:', error)
    return null
  }
}

/**
 * Get all documents for a driver
 */
export async function getDriverDocuments(
  supabase: SupabaseClient,
  driverId: string
) {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('driver_id', driverId)
      .order('upload_date', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[v0] Error fetching driver documents:', error)
    return []
  }
}

/**
 * Get all documents for a subcontractor
 */
export async function getSubcontractorDocuments(
  supabase: SupabaseClient,
  subcontractorId: string
) {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('subcontractor_id', subcontractorId)
      .order('upload_date', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[v0] Error fetching subcontractor documents:', error)
    return []
  }
}

/**
 * Delete document and remove from storage
 */
export async function deleteDocument(
  supabase: SupabaseClient,
  documentId: string
) {
  try {
    // Get document info
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('storage_path')
      .eq('id', documentId)
      .single()

    if (fetchError || !doc) throw fetchError

    // Delete from storage
    if (doc.storage_path) {
      await supabase.storage
        .from('documents')
        .remove([doc.storage_path])
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) throw deleteError

    return true
  } catch (error) {
    console.error('[v0] Error deleting document:', error)
    return false
  }
}

/**
 * Search documents by file name or type
 */
export async function searchDocuments(
  supabase: SupabaseClient,
  query: string,
  filters?: {
    documentType?: string
    driverId?: string
    subcontractorId?: string
  }
) {
  try {
    let queryBuilder = supabase.from('documents').select('*')

    if (filters?.driverId) {
      queryBuilder = queryBuilder.eq('driver_id', filters.driverId)
    }

    if (filters?.subcontractorId) {
      queryBuilder = queryBuilder.eq('subcontractor_id', filters.subcontractorId)
    }

    if (filters?.documentType) {
      queryBuilder = queryBuilder.eq('document_type', filters.documentType)
    }

    if (query) {
      queryBuilder = queryBuilder.ilike('file_name', `%${query}%`)
    }

    const { data, error } = await queryBuilder.order('upload_date', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[v0] Error searching documents:', error)
    return []
  }
}

/**
 * Get expiring documents (within 30 days)
 */
export async function getExpiringDocuments(
  supabase: SupabaseClient
) {
  try {
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .not('expiry_date', 'is', null)
      .lte('expiry_date', thirtyDaysFromNow.toISOString())
      .gt('expiry_date', new Date().toISOString())
      .order('expiry_date', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[v0] Error fetching expiring documents:', error)
    return []
  }
}
