// Mock clients data - Extracted to separate file for optimal webpack bundling
export const MOCK_CLIENTS = [
  {
    id: '1',
    rut: '76.123.456-7',
    razonSocial: 'Transportes Santiago SpA',
    email: 'contacto@transantiago.com',
    telefono: '+56912345678',
    ciudad: 'Santiago',
    estado: 'activo',
    totalVehiculos: 24,
    totalConductores: 18,
    complianceScore: 92,
  },
  {
    id: '2',
    rut: '76.234.567-8',
    razonSocial: 'Logística Express Ltda',
    email: 'info@logexp.com',
    telefono: '+56923456789',
    ciudad: 'Valparaíso',
    estado: 'activo',
    totalVehiculos: 15,
    totalConductores: 12,
    complianceScore: 88,
  },
  {
    id: '3',
    rut: '76.345.678-9',
    razonSocial: 'Transportes del Sur SA',
    email: 'contacto@transur.com',
    telefono: '+56934567890',
    ciudad: 'Concepción',
    estado: 'pendiente',
    totalVehiculos: 8,
    totalConductores: 6,
    complianceScore: 75,
  },
]

export const MOCK_AUDIT_LOGS = [
  { id: 1, user: 'admin@docufleet.com', action: 'Document Validated', entity: 'RTV-2024-001', timestamp: '2024-03-20 14:30', status: 'success' },
  { id: 2, user: 'transportista@example.com', action: 'Document Uploaded', entity: 'Licencia-001', timestamp: '2024-03-20 13:15', status: 'success' },
  { id: 3, user: 'conductor@example.com', action: 'Role Assigned', entity: 'User-123', timestamp: '2024-03-20 12:00', status: 'success' },
]

export const MOCK_COMPLIANCE_DATA = [
  { name: 'Semana 1', compliant: 85, noncompliant: 15 },
  { name: 'Semana 2', compliant: 90, noncompliant: 10 },
  { name: 'Semana 3', compliant: 88, noncompliant: 12 },
  { name: 'Semana 4', compliant: 92, noncompliant: 8 },
]
