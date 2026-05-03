# Executive Staff Management System

## Overview

The Executive Staff Management System allows organizations to manage their executives and HR personnel. This system includes 6 members of the Transportes Labbe team with their contact information and roles.

## Executive Directory - Transportes Labbe

### Executives (Ejecutivas)
1. **Olga Lydia Carrasco Olivares**
   - RUT: 10574005-0
   - Role: Ejecutiva
   - Phone: +56977764753

2. **Carolina Pilar Sepulveda Contreras**
   - RUT: 15464094-0
   - Role: Ejecutiva
   - Phone: +56950067666

3. **Daniela Constanza Silva Rojas**
   - RUT: 17768246-2
   - Role: Ejecutiva
   - Phone: +56978540722

4. **Cecilia Del Carmen Farias Muñoz**
   - RUT: 9888992-2
   - Role: Ejecutiva
   - Phone: +56978540798

### HR Department
5. **Diego Andres Gonzalez Valenzuela**
   - RUT: 20114106-0
   - Role: Jefe RRHH (HR Manager)
   - Phone: +56978455527

6. **Katherinne Johanna Canales Hernandez**
   - RUT: 18717311-6
   - Role: Asistente RRHH (HR Assistant)
   - Phone: +56956139744

## Features

### Admin Interface
- **View All Executives**: Browse complete list of registered staff
- **Add New Executive**: Register new executives with full details
- **Edit Information**: Update contact details and roles
- **Delete/Deactivate**: Remove executives from active list
- **Quick Directory**: One-click access to phone and email

### API Endpoints

#### GET /api/admin/executive-staff
Fetch all active executives, optionally filtered by company

**Query Parameters:**
- `transportista_id` (optional): Filter by specific company

**Response:**
```json
{
  "executives": [
    {
      "id": "uuid",
      "nombre_completo": "Name",
      "rut": "RUT-D",
      "cargo": "Position",
      "telefono": "Phone",
      "email": "Email",
      "transportista_id": "company-id",
      "is_active": true,
      "created_at": "timestamp"
    }
  ]
}
```

#### POST /api/admin/executive-staff
Create a new executive record

**Request Body:**
```json
{
  "transportista_id": "company-id",
  "nombre_completo": "Full Name",
  "rut": "RUT-D",
  "cargo": "Position",
  "telefono": "Phone Number",
  "email": "Email Address",
  "direccion": "Address"
}
```

#### PUT /api/admin/executive-staff
Update executive information

**Request Body:**
```json
{
  "id": "executive-id",
  "nombre_completo": "Updated Name",
  "cargo": "Updated Position",
  "telefono": "Updated Phone",
  "email": "Updated Email"
}
```

#### DELETE /api/admin/executive-staff
Deactivate an executive (soft delete)

**Query Parameters:**
- `id`: Executive ID to deactivate

## Database Schema

```sql
CREATE TABLE public.executive_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transportista_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  nombre_completo TEXT NOT NULL,
  rut TEXT NOT NULL UNIQUE,
  cargo TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## UI Components

### ExecutiveStaffManager
Main component for managing executives with CRUD operations
- Location: `components/admin/executive-staff-manager.tsx`
- Features: Table view, add/edit/delete dialogs, role badges

### Executive Staff Page
Admin page for viewing and managing all executives
- Location: `app/admin/executive-staff/page.tsx`
- Features: Statistics cards, executive directory, management interface

## Integration with Other Systems

### With Conductor Management
Executives can manage driver documents and compliance records for their company.

### With Company Management
Each executive is linked to their parent company (Transportes Labbe).

### With Document Upload
Executives can oversee document uploads from drivers and conductors.

## Security

- **Row Level Security (RLS)**: Authenticated users can view and manage executive staff
- **Data Validation**: RUT uniqueness is enforced
- **Soft Deletes**: Executives are marked inactive rather than deleted
- **Audit Trail**: Creation and update timestamps are tracked

## Usage Examples

### Fetch all executives for a company
```typescript
const response = await fetch('/api/admin/executive-staff?transportista_id=company-id');
const { executives } = await response.json();
```

### Add a new executive
```typescript
const response = await fetch('/api/admin/executive-staff', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transportista_id: 'company-id',
    nombre_completo: 'John Doe',
    rut: '12345678-9',
    cargo: 'Gerente',
    telefono: '+56912345678',
    email: 'john@example.com'
  })
});
```

### Update executive information
```typescript
const response = await fetch('/api/admin/executive-staff', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'executive-id',
    telefono: '+56987654321',
    email: 'newemail@example.com'
  })
});
```

## Future Enhancements

1. **Bulk Import**: Import executives from CSV/Excel
2. **Email Notifications**: Send updates when documents are uploaded
3. **Role-Based Permissions**: Different access levels for different roles
4. **Activity Logging**: Track all actions performed by executives
5. **Integration with Auth System**: Executive login capabilities
6. **Org Chart View**: Visual hierarchy of management structure
7. **Performance Metrics**: Track executive activities and compliance rates

## Support

For issues or questions about the executive staff system, please contact the development team or check the main documentation index.
