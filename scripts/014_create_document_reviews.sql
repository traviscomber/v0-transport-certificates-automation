-- Create document_reviews table for tracking document verification by executives
-- This table stores all reviews, approvals, and rejections of uploaded documents

CREATE TABLE IF NOT EXISTS public.document_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference to the certificate/document being reviewed
  document_id UUID NOT NULL REFERENCES public.certificates(id) ON DELETE CASCADE,
  
  -- Executive who performed the review
  reviewed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Review status
  review_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (review_status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  
  -- Detailed findings from the review (JSON format)
  findings JSONB DEFAULT '{}',
  
  -- OCR data extracted (stored for historical reference)
  ocr_data JSONB DEFAULT '{}',
  
  -- Review notes/comments
  review_notes TEXT,
  
  -- Reason for rejection (if rejected)
  rejection_reason TEXT,
  
  -- Change requests (if changes_requested)
  change_requests JSONB DEFAULT '{}',
  
  -- Timestamps
  review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_date TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Company tracking for audit purposes
  company_name TEXT NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.document_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_reviews

-- Executives can view reviews of documents from their company
CREATE POLICY "Executives can view company reviews" ON public.document_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'executive'
      AND p.company_name = public.document_reviews.company_name
    )
  );

-- Executives can create reviews for documents in their company
CREATE POLICY "Executives can create reviews" ON public.document_reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'executive'
      AND p.company_name = public.document_reviews.company_name
    ) AND reviewed_by = auth.uid()
  );

-- Executives can update reviews they created
CREATE POLICY "Executives can update their reviews" ON public.document_reviews
  FOR UPDATE USING (
    reviewed_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'executive'
    )
  );

-- Admins can view all reviews
CREATE POLICY "Admins can view all reviews" ON public.document_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all reviews
CREATE POLICY "Admins can update all reviews" ON public.document_reviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_document_reviews_document_id ON public.document_reviews(document_id);
CREATE INDEX IF NOT EXISTS idx_document_reviews_reviewed_by ON public.document_reviews(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_document_reviews_status ON public.document_reviews(review_status);
CREATE INDEX IF NOT EXISTS idx_document_reviews_company ON public.document_reviews(company_name);
CREATE INDEX IF NOT EXISTS idx_document_reviews_review_date ON public.document_reviews(review_date DESC);
