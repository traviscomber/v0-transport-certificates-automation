import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'DocuFleet API by Segur-ia',
    description: 'API para gestión de documentos de transporte con validación IA (OpenAI Vision)',
    version: '1.0.0',
    contact: {
      name: 'Segur-ia',
      email: 'support@segur-ia.cl'
    }
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      description: 'API Server'
    }
  ],
  paths: {
    '/api/drivers': {
      get: {
        tags: ['Drivers'],
        summary: 'Listar todos los conductores',
        parameters: [
          {
            name: 'organization_id',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Filtrar por organización'
          }
        ],
        responses: {
          '200': {
            description: 'Lista de conductores',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array' },
                    success: { type: 'boolean' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Drivers'],
        summary: 'Crear nuevo conductor',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['organization_id', 'full_name', 'rut'],
                properties: {
                  organization_id: { type: 'string', description: 'ID de la organización' },
                  full_name: { type: 'string', description: 'Nombre completo del conductor' },
                  rut: { type: 'string', description: 'RUT chileno (ej: 12.345.678-9)' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string', description: 'Teléfono formato chileno' },
                  license_number: { type: 'string' },
                  license_type: { type: 'string', enum: ['A1', 'A2', 'A3', 'A4', 'A5', 'B', 'C', 'D', 'E', 'F'] },
                  license_expiry: { type: 'string', format: 'date', description: 'YYYY-MM-DD o DD/MM/YYYY' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Conductor creado' },
          '400': { description: 'Datos inválidos' },
          '500': { description: 'Error del servidor' }
        }
      }
    },
    '/api/drivers/{id}': {
      get: {
        tags: ['Drivers'],
        summary: 'Obtener conductor por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': { description: 'Datos del conductor' },
          '404': { description: 'Conductor no encontrado' }
        }
      },
      put: {
        tags: ['Drivers'],
        summary: 'Actualizar conductor',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  full_name: { type: 'string' },
                  rut: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  license_type: { type: 'string' },
                  license_expiry: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Conductor actualizado' },
          '400': { description: 'Datos inválidos' },
          '404': { description: 'Conductor no encontrado' }
        }
      },
      delete: {
        tags: ['Drivers'],
        summary: 'Eliminar conductor (soft delete)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': { description: 'Conductor eliminado' },
          '404': { description: 'Conductor no encontrado' }
        }
      }
    },
    '/api/vehicles': {
      get: {
        tags: ['Vehicles'],
        summary: 'Listar todos los vehículos',
        parameters: [
          {
            name: 'organization_id',
            in: 'query',
            required: false,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': { description: 'Lista de vehículos' }
        }
      },
      post: {
        tags: ['Vehicles'],
        summary: 'Crear nuevo vehículo',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['organization_id', 'plate'],
                properties: {
                  organization_id: { type: 'string' },
                  plate: { type: 'string', description: 'Patente (ABC-1234 o ABCD-12)' },
                  brand: { type: 'string' },
                  model: { type: 'string' },
                  year: { type: 'integer' },
                  type: { type: 'string', enum: ['bus', 'truck', 'van', 'car'] },
                  vin: { type: 'string', description: 'Número de chasis (17 caracteres)' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Vehículo creado' },
          '400': { description: 'Datos inválidos' }
        }
      }
    },
    '/api/vehicles/{id}': {
      get: {
        tags: ['Vehicles'],
        summary: 'Obtener vehículo por ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Datos del vehículo' } }
      },
      put: {
        tags: ['Vehicles'],
        summary: 'Actualizar vehículo',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  plate: { type: 'string' },
                  brand: { type: 'string' },
                  model: { type: 'string' },
                  year: { type: 'integer' },
                  type: { type: 'string' },
                  vin: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { '200': { description: 'Vehículo actualizado' } }
      },
      delete: {
        tags: ['Vehicles'],
        summary: 'Eliminar vehículo',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Vehículo eliminado' } }
      }
    },
    '/api/organizations': {
      get: {
        tags: ['Organizations'],
        summary: 'Listar organizaciones',
        parameters: [
          {
            name: 'type',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['transportista', 'mandante'] }
          }
        ],
        responses: { '200': { description: 'Lista de organizaciones' } }
      },
      post: {
        tags: ['Organizations'],
        summary: 'Crear organización',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'rut', 'type'],
                properties: {
                  name: { type: 'string' },
                  rut: { type: 'string', description: 'RUT empresa' },
                  type: { type: 'string', enum: ['transportista', 'mandante'] },
                  address: { type: 'string' },
                  city: { type: 'string' },
                  region: { type: 'string' },
                  phone: { type: 'string' },
                  email: { type: 'string', format: 'email' }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Organización creada' } }
      }
    },
    '/api/organizations/{id}': {
      get: {
        tags: ['Organizations'],
        summary: 'Obtener organización',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Datos de la organización' } }
      },
      put: {
        tags: ['Organizations'],
        summary: 'Actualizar organización',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  rut: { type: 'string' },
                  address: { type: 'string' },
                  city: { type: 'string' },
                  region: { type: 'string' },
                  phone: { type: 'string' },
                  email: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { '200': { description: 'Organización actualizada' } }
      },
      delete: {
        tags: ['Organizations'],
        summary: 'Eliminar organización',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Organización eliminada' } }
      }
    }
  },
  components: {
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          success: { type: 'boolean' }
        }
      }
    }
  }
}

export async function GET() {
  return NextResponse.json(swaggerSpec)
}
