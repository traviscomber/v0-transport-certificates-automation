# LABBE — Modelo canónico del sistema

Última validación: 2026-08-03

Este documento define cómo funciona LABBE en producción. Es la fuente de verdad para futuras mejoras de producto, código, base de datos y operación. Cuando exista una diferencia entre este documento, código legado, comentarios antiguos o supuestos históricos, se debe verificar el comportamiento real en Supabase y actualizar esta especificación junto con el cambio.

## 1. Propósito operacional

LABBE administra documentación de transporte, conductores, transportistas y subcontratistas. El sistema permite cargar, clasificar, revisar, aprobar, rechazar, consultar y medir el estado documental.

El objetivo principal no es almacenar un único archivo por entidad, sino mantener evidencia documental trazable por entidad, tipo y período.

## 2. Entidades canónicas

### Transportistas

Tabla principal: `transportistas`.

- Identidad comercial única por RUT.
- Relación de autenticación en `transportista_auth`.
- Flags de certificación vigentes en el esquema actual:
  - `ariztia`
  - `lts`
  - `rendic`
  - `interpolar`
- Cada flag verdadero representa una certificación asignada.
- El esquema actual no contiene una fuente canónica de fecha de vencimiento para estas certificaciones.

### Conductores

Tabla principal: `conductores`.

- Identidad única por RUT.
- Relación de autenticación en `conductor_auth`.
- Sus documentos se almacenan en `uploaded_documents`.

### Documentos de conductores

Tabla principal: `uploaded_documents`.

- Un conductor puede tener varias versiones del mismo tipo documental.
- Estados canónicos: `pending`, `approved`, `rejected` y valor nulo tratado operacionalmente como pendiente.
- La fecha de revisión se registra en `validated_at`.
- El período documental se mantiene en los campos de período disponibles en la tabla.

### Documentos de subcontratistas

Tabla principal: `subcontractor_documents`.

- Un transportista o subcontratista puede tener varias versiones del mismo tipo documental y período.
- Estados canónicos: `pending`, `approved`, `rejected`.
- La fecha de revisión se registra en `reviewed_at`.
- El período seleccionado por el usuario tiene prioridad sobre inferencias obtenidas desde nombre de archivo, metadata o fecha de carga.

### Tipos documentales

Fuentes principales:

- `document_types` para documentos generales y de conductores.
- `subcontractor_document_types` para documentos de subcontratistas.

Los documentos deben referenciar un tipo existente. No se consideran válidos documentos huérfanos sin tipo, conductor o transportista asociado cuando corresponda.

## 3. Carga masiva y múltiples registros

La base contiene una carga masiva histórica. Por diseño, pueden existir múltiples documentos para la misma combinación de:

- empresa o transportista;
- tipo documental;
- período.

Esto no constituye automáticamente un duplicado incorrecto.

Puede representar:

- una carga masiva válida;
- una versión corregida;
- un archivo rechazado seguido por una nueva versión;
- una renovación;
- historial documental;
- dos evidencias distintas para el mismo período.

Regla canónica: no eliminar registros solo porque coincidan entidad, tipo y período. Para considerar dos filas como duplicado accidental debe existir evidencia adicional, por ejemplo mismo contenido binario o hash, mismo archivo, misma operación idempotente o confirmación operacional.

Las URLs distintas indican archivos distintos, pero no prueban por sí solas que el contenido sea diferente. Cualquier deduplicación futura debe usar hash de contenido y preservar historial y trazabilidad.

## 4. Integridad validada

Estado validado el 2026-08-03:

- 0 RUT duplicados en `transportistas`.
- 0 RUT duplicados en `conductores`.
- 0 RUT duplicados en `companies`.
- 0 correos duplicados relevantes en perfiles y conductores.
- 0 documentos con estado inválido en las tablas documentales principales.
- 0 documentos huérfanos respecto de conductor, transportista o tipo documental en los flujos principales.
- 316 de 316 conductores con autenticación vinculada.
- 246 de 246 transportistas con autenticación vinculada.
- 6.495 documentos de subcontratistas.
- 64 documentos de conductores.
- 5 certificaciones asignadas según flags activos.

Estos conteos son una fotografía de validación y cambiarán con la operación. Las reglas de cálculo son canónicas; los números no deben hardcodearse.

## 5. Reglas de estados y trazabilidad

### Aprobación y rechazo

Cuando un documento pasa a `approved` o `rejected`:

- debe registrarse una fecha de revisión;
- el sistema no debe perder la versión anterior;
- la identidad del revisor debe registrarse cuando esté disponible;
- las estadísticas deben contar el estado almacenado, sin inferir estados desde la interfaz.

Existen triggers de base de datos para completar fechas de revisión ausentes en cambios futuros.

### Historial

El historial documental es información válida y no debe colapsarse en una única fila sin una política explícita de versionado.

Para vistas operativas puede mostrarse la versión más reciente o la versión aprobada vigente, pero la base debe conservar las versiones previas.

## 6. Reglas canónicas de estadísticas

### Documentos de conductores

- Total: conteo exacto de `uploaded_documents`.
- Aprobados: `validation_status = 'approved'`.
- Rechazados: `validation_status = 'rejected'`.
- Pendientes: registros restantes, incluyendo estado nulo cuando aplique.

### Documentos de subcontratistas

- Total: conteo exacto de `subcontractor_documents`.
- Aprobados: `status = 'approved'`.
- Rechazados: `status = 'rejected'`.
- Pendientes: `status = 'pending'`.

Los conteos deben realizarse mediante consultas exactas y no cargando solo las primeras 1.000 o 2.000 filas.

### Certificaciones

El total actual es la suma de flags verdaderos en `transportistas.ariztia`, `transportistas.lts`, `transportistas.rendic` y `transportistas.interpolar`.

Mientras no exista una fuente canónica de vencimiento:

- `total` = certificaciones asignadas;
- `vigentes` = certificaciones asignadas;
- `porVencer` = 0;
- `vencidas` = 0.

No se debe usar la cantidad de transportistas como cantidad de certificaciones.

## 7. Seguridad y acceso

- RLS está habilitado en todas las tablas públicas relevantes.
- El acceso anónimo directo a datos operacionales está cerrado.
- Las operaciones de servidor usan `SUPABASE_SERVICE_ROLE_KEY` mediante clientes exclusivos del backend.
- El navegador no debe recibir ni usar `service_role`.
- Las operaciones sensibles deben pasar por APIs autenticadas.
- No se deben agregar políticas RLS abiertas para resolver errores de frontend; primero debe corregirse la arquitectura de acceso.

## 8. Arquitectura de autenticación

LABBE usa autenticación de aplicación vinculada a tablas de dominio:

- `conductor_auth` ↔ `conductores`;
- `transportista_auth` ↔ `transportistas`;
- perfiles y roles administrativos según las tablas correspondientes.

Una mejora futura no debe asumir automáticamente que todos los usuarios son identidades nativas de Supabase Auth. Se debe revisar el middleware y las tablas de autenticación existentes antes de migrar o reemplazar el modelo.

## 9. Reglas para futuras mejoras

Toda mejora sustancial debe respetar lo siguiente:

1. No borrar historial documental por coincidencia de entidad, tipo y período.
2. Implementar idempotencia para nuevas cargas y cargas masivas.
3. Calcular hash de contenido para detectar archivos realmente idénticos.
4. Separar claramente documento vigente, versión más reciente e historial completo.
5. Mantener conteos exactos más allá del límite de 1.000 filas de Supabase.
6. No inventar vencimientos de certificaciones sin fuente de datos real.
7. Mantener RLS y acceso exclusivamente server-side para datos sensibles.
8. Agregar migraciones seguras, reversibles y verificadas contra datos existentes.
9. Actualizar este documento cuando cambie una regla de dominio.
10. Verificar siempre Supabase, build, deployment y logs antes de declarar una mejora terminada.

## 10. Prioridades estructurales recomendadas

Las siguientes mejoras deben construirse sobre este modelo:

- versionado documental explícito;
- hash de archivo e idempotencia de carga;
- selección canónica del documento vigente;
- auditoría completa de quién cargó, revisó y reemplazó cada archivo;
- métricas de cumplimiento por período y entidad;
- políticas de retención sin pérdida de evidencia;
- separación consistente entre transportista, subcontratista, conductor y empresa;
- eliminación progresiva de tablas o nombres legados solo después de migrar todos los consumidores.

## 11. Fuentes de verdad

Orden de precedencia:

1. esquema y datos productivos verificados en Supabase;
2. esta especificación canónica;
3. migraciones versionadas;
4. APIs de servidor y reglas de dominio compartidas;
5. componentes de interfaz;
6. documentación y comentarios legados.

La interfaz nunca debe convertirse en la fuente de verdad de una regla operacional.
