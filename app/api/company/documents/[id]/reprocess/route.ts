import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  extractDocumentMetadata,
  extractDocumentFromPdfBuffer,
  extractDocumentFromText,
} from '@/lib/ai-document-processor'
import { extractText } from 'unpdf'
import { generateAIAnalysisAlerts } from '@/lib/document-alerts-generator'
import { parseF30Document } from '@/lib