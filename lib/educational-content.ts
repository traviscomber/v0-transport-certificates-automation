'use client'

/**
 * ARCHIVO DE CONTENIDO EDUCATIVO - Educational Content Database
 * 
 * Propósito: Centralizar todas las explicaciones educativas del sistema
 * Hace fácil mantener, actualizar y traducir el contenido educativo
 * 
 * Estructura: Cada tab tiene su propia sección con:
 * - Título: Nombre de la guía
 * - Contenido: Explicación principal (1-2 párrafos claros)
 * - Tips: 3-5 consejos prácticos
 * - Ejemplos: 2-3 casos de uso reales
 */

export const educationalContent = {
  // TAB: CONTROL TOWER (Torre de Control)
  controlTower: {
    title: '¿Qué es la Torre de Control?',
    content: 'La Torre de Control es tu panel central de monitoreo. Aquí puedes ver el estado general de todas tus operaciones, conductores, documentos y alertas en un solo lugar. Es como el "corazón" de LABBE que te mantiene informado en tiempo real.',
    tips: [
      'Usa las tarjetas de estado para monitorear la salud general de tu operación',
      'Los números en rojo indican problemas que necesitan atención inmediata',
      'Haz clic en cualquier tarjeta para profundizar en los detalles',
      'Actualiza los datos cada 30 segundos automáticamente',
      'Los gráficos te muestran tendencias históricas importantes'
    ],
    examples: [
      'Si ves "5 Documentos Vencidos", haz clic para renovarlos',
      'Un conductor con "Licencia por Vencer" aparecerá marcado en rojo',
      'Los porcentajes de cumplimiento te muestran qué tan bien va tu flota'
    ]
  },

  // TAB: SUBCONTRACTISTAS
  subcontractors: {
    title: '¿Qué son los Subcontratistas?',
    content: 'Los Subcontratistas son empresas que trabajan bajo contrato con tu empresa principal. Aquí puedes verlos, registrar nuevos, editar información y monitorear su estado de cumplimiento normativo. Cada subcontratista tiene su propia información de contacto y cumplimiento.',
    tips: [
      'Busca por nombre, RUT o región para encontrar rápidamente un subcontratista',
      'Verifica que los datos estén actualizados regularmente',
      'Los estados como "Ariztia" indican que han pasado controles específicos',
      'Puedes editar cualquier subcontratista haciendo clic en sus datos',
      'Exporta la lista para usar en otros sistemas'
    ],
    examples: [
      'Busca "Transportes Chile" en la barra de búsqueda',
      'Filtra por región "Región Metropolitana" para ver quién opera allí',
      'Haz clic en "Editar" para cambiar el teléfono o email de contacto'
    ]
  },

  // TAB: CONDUCTORES
  drivers: {
    title: '¿Qué son los Conductores?',
    content: 'Los Conductores son personas que operan tus vehículos de transporte. Aquí ves todos tus conductores registrados, sus datos personales, licencias, empresas proveedoras asociadas. Puedes gestionar, editar y monitorear su documentación.',
    tips: [
      'Cada conductor está vinculado a un proveedor específico',
      'Las patentes de tracto indican qué vehículos pueden manejar',
      'Busca por RUT para encontrar un conductor específico rápidamente',
      'El sistema alerta cuando una licencia está próxima a vencer',
      'Puedes desactivar conductores sin eliminar sus datos históricos'
    ],
    examples: [
      'Busca el RUT "18.012.757-7" para encontrar a Ruben Marchant',
      'Filtra por empresa "Transportes XYZ" para ver sus conductores',
      'Verifica la patente del tracto antes de asignar rutas'
    ]
  },

  // TAB: DOCUMENTOS
  documents: {
    title: '¿Qué son los Documentos?',
    content: 'Los Documentos son todos los archivos relacionados con tu operación: licencias de conducir, permisos, certificados, carnet de identidad, etc. El sistema supervisa que estén vigentes y te alerta cuando algo próximo a vencer o ya venció.',
    tips: [
      'El sistema valida automáticamente documentos cuando se suben',
      'Los documentos vencidos aparecen en rojo para que los renueves',
      'Puedes ver el historial completo de cada documento',
      'El sistema extrae datos automáticamente (OCR) de los documentos',
      'Todos los documentos se guardan en la nube de forma segura'
    ],
    examples: [
      'Una licencia de conducir vence en 5 años desde su emisión',
      'Un permiso de circulación se renueva anualmente',
      'El certificado de gases debe renovarse cada 2 años'
    ]
  },

  // TAB: EQUIPO
  team: {
    title: '¿Qué es el Equipo?',
    content: 'El Equipo es el grupo de personas en tu empresa que usa el sistema LABBE. Aquí ves quiénes tienen acceso, qué permisos tienen y puedes gestionar roles como Administrador, Supervisor o Ejecutivo.',
    tips: [
      'Solo los Administradores pueden agregar o eliminar miembros del equipo',
      'Cada rol tiene permisos diferentes en el sistema',
      'Puedes ver cuándo fue la última vez que alguien entró al sistema',
      'Desactiva a usuarios que ya no usan el sistema',
      'El correo electrónico debe ser único para cada miembro del equipo'
    ],
    examples: [
      'El Administrador puede ver y editar todo',
      'Un Supervisor solo puede ver reportes pero no modificar datos críticos',
      'Un Ejecutivo puede ver solo su región o asignación'
    ]
  },

  // TAB: ALERTAS
  alerts: {
    title: '¿Qué son las Alertas?',
    content: 'Las Alertas son notificaciones automáticas del sistema que te avisarán sobre eventos importantes: documentos que vencen, conductores bloqueados, nuevos uploads, cambios de estado. Son avisos inteligentes para que no se te escape nada importante.',
    tips: [
      'Las alertas críticas (rojo) necesitan atención inmediata',
      'Las alertas altas (naranja) deben resolverse pronto',
      'Marca las alertas como leídas cuando las hayas visto',
      'Puedes filtrar alertas por tipo, prioridad o fecha',
      'El bell icon en la navbar te muestra cuántas alertas tienes sin leer'
    ],
    examples: [
      'Alerta crítica: "Documento vencido - Licencia de Ruben Marchant"',
      'Alerta alta: "Documento próximo a vencer en 5 días"',
      'Alerta normal: "Nuevo documento subido por conductor"'
    ]
  },

  // CONCEPTOS GENERALES
  general: {
    businessLogic: {
      title: '¿Cómo funciona el sistema?',
      content: 'LABBE gestiona tres elementos principales: 1) Conductores (personas), 2) Documentos (archivos), 3) Eventos (cambios). El sistema monitorea automáticamente que todo esté en orden y te alerta cuando algo necesita atención.',
      tips: [
        'El sistema funciona 24/7 monitoreando tu operación',
        'Todos los cambios quedan registrados en el histórico',
        'Los datos se sincronizan en tiempo real',
        'Puedes ver quién hizo qué cambio y cuándo'
      ]
    },
    compliance: {
      title: '¿Qué es Cumplimiento Normativo?',
      content: 'El Cumplimiento significa que todos tus conductores y documentos están en orden según las leyes y regulaciones de Chile. LABBE verifica automáticamente esto y te avisa si algo no cumple.',
      tips: [
        'La licencia de conducir debe estar vigente',
        'Los permisos circulatorios deben estar al día',
        'Las revisiones técnicas (RTV) deben ser actuales',
        'El sistema calcula un "Score de Cumplimiento" automáticamente'
      ]
    },
    security: {
      title: '¿Cómo está protegida mi información?',
      content: 'Tu información está protegida por múltiples capas de seguridad: encriptación, autenticación, permisos por rol, backups automáticos y auditoría de cambios. Solo personas autorizadas pueden ver tus datos.',
      tips: [
        'Tu contraseña nunca se guarda en texto plano',
        'Cada usuario tiene un registro de qué hizo y cuándo',
        'Los datos se respaldan automáticamente cada día',
        'Puedes reportar un acceso no autorizado al equipo de soporte'
      ]
    }
  }
}

/**
 * Función helper para obtener contenido educativo
 * Uso: getEducationalContent('drivers')
 */
export function getEducationalContent(key: keyof typeof educationalContent) {
  return educationalContent[key]
}
