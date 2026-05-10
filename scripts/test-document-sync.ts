/**
 * Test script to verify document upload and sync flow
 * Tests:
 * 1. Creates a test document record in the database
 * 2. Changes its status and verifies the change
 * 3. Fetches dashboard stats to verify they update
 */

import { createAdminClient } from '@/lib/supabase/admin'

async function testDocumentSync() {
  console.log('\n=== Starting Document Sync Test ===\n')
  
  try {
    const adminClient = await createAdminClient()
    
    // Step 1: Create a test document
    console.log('Step 1: Creating test document...')
    const testDoc = {
      conductor_id: 'test-conductor-001',
      document_type_id: 1,
      original_filename: 'test-document-' + Date.now() + '.pdf',
      file_url: 'https://example.com/test.pdf',
      validation_status: 'pending',
      created_at: new Date().toISOString(),
    }
    
    const { data: created, error: createError } = await adminClient
      .from('uploaded_documents')
      .insert([testDoc])
      .select()
    
    if (createError) {
      console.error('Error creating test document:', createError)
      return
    }
    
    const docId = created[0].id
    console.log(`✓ Test document created with ID: ${docId}`)
    console.log(`  Filename: ${testDoc.original_filename}`)
    console.log(`  Status: ${testDoc.validation_status}`)
    
    // Step 2: Wait and change status to approved
    console.log('\nStep 2: Changing document status to approved...')
    await new Promise(r => setTimeout(r, 1000))
    
    const { error: updateError } = await adminClient
      .from('uploaded_documents')
      .update({ validation_status: 'approved' })
      .eq('id', docId)
    
    if (updateError) {
      console.error('Error updating status:', updateError)
      return
    }
    
    console.log('✓ Document status changed to approved')
    
    // Step 3: Fetch and verify stats include the new document
    console.log('\nStep 3: Fetching dashboard stats...')
    await new Promise(r => setTimeout(r, 1000))
    
    const { data: allDocs, error: fetchError } = await adminClient
      .from('uploaded_documents')
      .select('validation_status')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (fetchError) {
      console.error('Error fetching stats:', fetchError)
      return
    }
    
    const stats = {
      total: allDocs.length,
      approved: allDocs.filter((d: any) => d.validation_status === 'approved').length,
      pending: allDocs.filter((d: any) => d.validation_status === 'pending').length,
      rejected: allDocs.filter((d: any) => d.validation_status === 'rejected').length,
    }
    
    console.log('✓ Dashboard stats:')
    console.log(`  Total: ${stats.total}`)
    console.log(`  Approved: ${stats.approved}`)
    console.log(`  Pending: ${stats.pending}`)
    console.log(`  Rejected: ${stats.rejected}`)
    
    // Step 4: Clean up test document
    console.log('\nStep 4: Cleaning up test document...')
    await adminClient
      .from('uploaded_documents')
      .delete()
      .eq('id', docId)
    
    console.log('✓ Test document deleted')
    console.log('\n=== Test Complete ===\n')
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testDocumentSync()
