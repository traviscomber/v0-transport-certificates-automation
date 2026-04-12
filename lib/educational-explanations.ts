'use client'

/**
 * MAPA DE EXPLICACIONES EDUCATIVAS
 * 
 * Propósito: Mostrar explicaciones contextuales para cada elemento del UI
 * Centraliza todos los tooltips y explicaciones del sistema
 * 
 * Uso: <EducationalTooltip {...educationalExplanations.controlTower.title} />
 */

export const educationalExplanations = {
  // CONTROL TOWER
  controlTower: {
    title: {
      tooltip: '¿Qué es la Torre de Control?',
      explanation: 'La Torre de Control es tu panel central. Aquí ves el estado de toda tu operación de un vistazo: cuántos conductores tienes activos, qué documentos vencen pronto, alertas importantes, etc.'
    },
    statusCards: {
      tooltip: 'Tarjetas de Estado',
      explanation: 'Cada tarjeta muestra un número importante. El rojo significa problemas que necesitan atención ahora. El verde significa todo bien. Haz clic en cualquier tarjeta para ver más detalles.'
    },
    compliance: {
      tooltip: 'Score de Cumplimiento',
      explanation: 'Este porcentaje indica qué tan bien tu operación cumple con todas las regulaciones. 100% es perfecto. Si está bajo, revisa qué documentos le faltan a cada conductor.'
    },
    recentAlerts: {
      tooltip: 'Alertas Recientes',
      explanation: 'Aquí ves los últimos eventos importantes: documentos vencidos, conductores nuevos, cambios de estado. Revísalos regularmente.'
    }
  },

  // SUBCONTRACTISTAS
  subcontractors: {
    search: {
      tooltip: 'Buscar Subcontratista',
      explanation: 'Escribe el nombre, RUT o empresa que buscas. El sistema busca en tiempo real mientras escribes. Presiona Enter o espera 2 segundos.'
    },
    filters: {
      tooltip: 'Filtrar Resultados',
      explanation: 'Usa los filtros para agrupar por región, ejecutiva o estado. Esto hace más fácil encontrar lo que necesitas rápidamente.'
    },
    sort: {
      tooltip: 'Ordenar Lista',
      explanation: 'Cambia el orden de la lista: por nombre (A-Z), por RUT o por ejecutiva. Esto te ayuda a organizar la información de la forma que prefieras.'
    },
    addNew: {
      tooltip: 'Agregar Nuevo Subcontratista',
      explanation: 'Haz clic aquí para registrar un nuevo subcontratista en el sistema. Necesitarás su RUT, nombre, datos de contacto y otra información.'
    }
  },

  // CONDUCTORES
  drivers: {
    rut: {
      tooltip: 'Cédula de Identidad (RUT)',
      explanation: 'El RUT es el número único de identidad del conductor. Formato: XX.XXX.XXX-X. Se usa para identificar al conductor en todo el sistema.'
    },
    proveedor: {
      tooltip: 'Empresa Proveedora',
      explanation: 'Es la empresa transportista a la que pertenece el conductor. Puede haber un conductor con varios proveedores, pero aquí vemos el principal.'
    },
    patenteTracto: {
      tooltip: 'Patente del Tracto',
      explanation: 'Es el número de la placa del vehículo (camión). Ejemplo: "XW7026". Se usa para identificar qué vehículo opera cada conductor.'
    },
    licencia: {
      tooltip: 'Licencia de Conducir',
      explanation: 'Documento que autoriza a una persona a manejar. Tiene una clase (A, B, C, etc.) y una fecha de vencimiento. Debe estar siempre vigente.'
    },
    addDriver: {
      tooltip: 'Registrar Nuevo Conductor',
      explanation: 'Agrega un nuevo conductor al sistema. Deberás ingresar sus datos personales, licencia de conducir y empresa proveedora.'
    }
  },

  // DOCUMENTOS
  documents: {
    uploadDoc: {
      tooltip: 'Subir Documento',
      explanation: 'Haz clic para subir un documento (foto, PDF, etc.). El sistema lo guardará en la nube y extraerá automáticamente la información importante.'
    },
    validation: {
      tooltip: 'Estado de Validación',
      explanation: 'Pendiente = siendo revisado. Aprobado = válido y vigente. Rechazado = hay un problema. Vencido = ya no sirve.'
    },
    expiry: {
      tooltip: 'Fecha de Vencimiento',
      explanation: 'La fecha en que el documento deja de ser válido. El sistema te avisa cuando está próximo a vencer (7 días antes) y cuando ya venció.'
    },
    ocr: {
      tooltip: 'Lectura Automática (OCR)',
      explanation: 'El sistema lee automáticamente el documento usando inteligencia artificial. Extrae datos como fecha, número, etc. sin que lo hagas manualmente.'
    }
  },

  // ALERTAS
  alerts: {
    critical: {
      tooltip: 'Alerta Crítica (Rojo)',
      explanation: 'Problema que DEBE resolverse ahora mismo. Ejemplo: Documento vencido, conductor bloqueado, incumplimiento regulatorio.'
    },
    high: {
      tooltip: 'Alerta Alta (Naranja)',
      explanation: 'Problema importante que debe resolverse pronto. Ejemplo: Documento próximo a vencer en los próximos 7 días.'
    },
    normal: {
      tooltip: 'Alerta Normal (Azul)',
      explanation: 'Información importante pero no urgente. Ejemplo: Nuevo documento subido, cambio de estado, actualización de información.'
    },
    markAsRead: {
      tooltip: 'Marcar como Leído',
      explanation: 'Indica que ya viste la alerta. Esto limpia tu panel de notificaciones sin eliminar el registro histórico.'
    }
  },

  // GENERAL/CONCEPTOS
  general: {
    dashboard: {
      tooltip: 'Panel Principal',
      explanation: 'Este es tu área principal de trabajo. Aquí ves todos tus datos, reportes y puedes realizar acciones.'
    },
    sidebar: {
      tooltip: 'Menú Lateral',
      explanation: 'Usa este menú para navegar entre diferentes secciones del sistema. Haz clic en cualquier opción para cambiar de vista.'
    },
    userProfile: {
      tooltip: 'Tu Perfil de Usuario',
      explanation: 'Aquí puedes ver tu información, cambiar contraseña, ver tu rol y permisos en el sistema.'
    },
    logout: {
      tooltip: 'Cerrar Sesión',
      explanation: 'Haz clic aquí para salir de tu cuenta de forma segura. Siempre cierra sesión si usas una computadora compartida.'
    }
  }
}

/**
 * Tipos para TypeScript
 */
export type EducationalExplanationKey = keyof typeof educationalExplanations
