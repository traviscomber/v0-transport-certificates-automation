## Sistema de Alertas - Guía Educativa

Este documento explica cómo funciona el sistema de alertas en LABBE de forma clara y educativa.

### Conceptos Básicos

El sistema de alertas es el **sistema central de notificaciones** que alerta a admins, managers y supervisors cuando:
- Un conductor sube un documento
- Un cliente sube documentos
- Un documento es aprobado o rechazado
- Un documento está vencido o próximo a vencer
- Una entidad (conductor/cliente) está bloqueada o en riesgo

### Componentes Principales

1. **Base de Datos**: Tabla `alerts` que almacena todas las alertas
2. **API**: Endpoints que crean y recuperan alertas
3. **Componentes UI**: Visualizadores de alertas (bell icon, tab, widgets)
4. **Generador**: Lógica que crea alertas automáticamente

### Flujo de una Alerta

```
1. Evento ocurre (documento subido, vencido, etc)
2. Sistema genera alerta (createAlert() en alert-system.ts)
3. Alerta se guarda en BD
4. Admin ve bell icon con número
5. Admin hace clic en "Alertas" tab
6. Alerta se muestra en lista
7. Admin puede marcar como leída
```

### Archivos Clave

- `/lib/operations/alert-system.ts` - Lógica de creación de alertas
- `/lib/document-alerts-generator.ts` - Generador de alertas de documentos
- `/app/api/alerts/route.ts` - API para obtener alertas
- `/components/alerts-bell-icon.tsx` - Bell icon en UI
- `/app/dashboard/company/page.tsx` - Tab de alertas

### Tipos de Alertas

- DOCUMENT_UPLOADED - Documento nuevo
- DOCUMENT_VALIDATED - Documento aprobado  
- DOCUMENT_REJECTED - Documento rechazado
- DOCUMENT_EXPIRED - Documento vencido
- DOCUMENT_EXPIRING_SOON - Documento próximo a vencer
- ENTITY_BLOCKED - Conductor/cliente bloqueado
- COMPLIANCE_SCORE_LOW - Score de cumplimiento bajo
