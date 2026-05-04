-- Add ejecutiva column to uploaded_documents to track which executive the document belongs to
ALTER TABLE uploaded_documents
ADD COLUMN ejecutiva VARCHAR(255),
ADD CONSTRAINT fk_ejecutiva FOREIGN KEY (ejecutiva) REFERENCES subcontratistas(ejecutiva);

-- Create index for faster filtering by ejecutiva
CREATE INDEX idx_uploaded_documents_ejecutiva ON uploaded_documents(ejecutiva);

-- Backfill ejecutiva for existing documents by joining with conductores and subcontratistas
UPDATE uploaded_documents ud
SET ejecutiva = s.ejecutiva
FROM conductores c
LEFT JOIN subcontratistas s ON c.rut_proveedor = s.rut_proveedor
WHERE ud.conductor_id = c.id AND s.ejecutiva IS NOT NULL;
