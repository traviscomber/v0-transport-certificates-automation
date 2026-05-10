# Subcontractors Documentation System

## Document Requirements Configuration

Based on your CSV data and the system requirements, here are the document categories and requirements for subcontractors:

### Subcontratación Category (Required)
These 3 documents are mandatory for all subcontractors:

| Code | Name | Description | Validity |
|------|------|-------------|----------|
| CONTRATOS_SUBCONTRATACION | Contratos de Subcontratación | Subcontracting agreements | 365 days |
| F30_1 | F-30-1 Actualizado | Certificate of freight capacity | 365 days |
| CUMPLIMIENTO_PREVISIONAL | Cumplimiento Previsional | Social security compliance | 90 days |

### Empresa Category (Conditional)
These 5 documents are required if the subcontractor is a company:

| Code | Name | Description |
|------|------|-------------|
| RUT_EMPRESA | RUT Empresa | Company tax ID |
| ESCRITURA_CONSTITUCION | Escritura de Constitución | Constitutional deed |
| CERTIFICADO_VIGENCIA | Certificado de Vigencia | Certificate of business vigency |
| PODER_REPRESENTANTE | Poder Representante | Power of attorney |
| CEDULA_REPRESENTANTE | Cédula Representante | Representative's ID |

## Implementation Details

### API Endpoint
- **GET `/api/subcontractors/[id]/documents`**
  - Fetches uploaded documents for a subcontractor
  - Returns requirements grouped by category
  - Includes compliance status for each requirement
  - Maps documents to requirements with validation

### Frontend Components
- **DocumentManagementModal**
  - Dropdown grouped by category (Subcontratación, Empresa)
  - Upload interface with file type validation
  - Per-category progress tracking (X/Y documents)
  - Document status indicators (✓ uploaded, ⚠ pending)

### Document States
- `no_subido` - Not uploaded yet (gray)
- `pendiente` - Awaiting review (yellow)
- `aprobado` - Approved (green)
- `rechazado` - Rejected (red)
- `vencido` - Expired (orange)

### Storage
- Documents stored in Supabase storage bucket: `documents`
- Folder structure: `{subcontractor_id}/{requirement_code}/{timestamp}-{filename}`
- Database records track: upload date, expiry date, status, file URL

## Certifications
Tracked as boolean fields per subcontractor:
- Ariztia
- LTS
- Rendic
- Interpolar

These are displayed in the certification section of the subcontractor detail card.
