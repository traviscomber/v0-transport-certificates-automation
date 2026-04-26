import { createAdminClient } from '@/lib/supabase/admin'

export async function debugDocuments() {
  try {
    const adminClient = await createAdminClient()
    
    console.log('[v0 DEBUG] ===== DOCUMENTO DEBUG START =====')
    
    // Get all documents from driver_documents
    const { data: allDocs, error: docsError } = await adminClient
      .from('driver_documents')
      .select('id, driver_id, file_name, document_type, file_url, status, created_at')
      .limit(10)
    
    if (docsError) {
      console.error('[v0 DEBUG] Error fetching documents:', docsError)
      return
    }
    
    console.log('[v0 DEBUG] Found', allDocs?.length, 'documents')
    
    if (allDocs && allDocs.length > 0) {
      allDocs.forEach((doc: any, idx: number) => {
        console.log(`[v0 DEBUG] Document ${idx + 1}:`, {
          id: doc.id,
          driver_id: doc.driver_id,
          file_name: doc.file_name,
          document_type: doc.document_type,
          file_url: doc.file_url,
          file_url_type: typeof doc.file_url,
          file_url_isEmpty: !doc.file_url || doc.file_url === '',
          file_url_length: doc.file_url?.length || 0,
          status: doc.status,
          created_at: doc.created_at
        })
      })
    }
    
    console.log('[v0 DEBUG] ===== DOCUMENTO DEBUG END =====')
  } catch (err) {
    console.error('[v0 DEBUG] Unexpected error:', err)
  }
}
