# Diagnóstico de Cambios de Estado en Tiempo Real

## 🔍 ¿Qué Cambié?

Actualicé el sistema para que cuando cambies el estado de un documento a "Rechazado" (o cualquier otro estado), ocurra lo siguiente **automáticamente**:

### 1. **Endpoint API Mejorado** ✅
Archivo: `/app/api/company/documents/[id]/status/route.ts`

**Cambios:**
- ✅ Ahora captura el estado ANTES del cambio
- ✅ Emite evento al orquestrador inteligente
- ✅ Registra timestamp del cambio
- ✅ Retorna confirmación de broadcast en tiempo real

**Flujo:**
```
[Tu click en "Rechazado"] 
  ↓
[API PATCH /status] 
  ↓
[Actualiza BD + Emite evento]
  ↓
[Supabase Realtime broadcast]
  ↓
[Clientes reciben cambio]
```

### 2. **Hook de Validación** ✅
Archivo: `/hooks/use-document-management.ts`

**Cambios:**
- ✅ Después de cambiar estado, VERIFICA que se actualizó (3 intentos)
- ✅ Si falla la verificación, reintenta con delay exponencial
- ✅ Registra cada intento en la consola
- ✅ Nunca deja cambios "a mitad camino"

**Proceso:**
```
1. Envía cambio de estado
2. Espera respuesta del servidor
3. VERIFICA: ¿Se actualizó en BD?
4. Si no, reintenta 2 veces más
5. Confirma al usuario con éxito
```

---

## 🎯 Qué Esperar Ahora

Cuando cambies estado a "Rechazado":

### **Consola del Navegador (F12):**
```
[v0] 🔄 Hook: changeStatus called with: {
  documentId: "abc123", 
  status: "rechazado", 
  reason: "" 
}

[v0] 📥 Hook: Status change response: { 
  status: 200, 
  data: {...} 
}

[v0] ✅ Hook: Status changed successfully on server

[v0] 🔍 Verifying status update...

[v0] ✅ Status verified on attempt 1/3: rechazado
```

### **Base de Datos (Supabase):**
- Tabla: `driver_documents`
- Columna: `status`
- Cambio: `pendiente` → `rechazado`
- Timestamp: Actualizado

### **UI en Pantalla:**
- El estado DEBE cambiar en menos de 2 segundos
- El modal se cierra automáticamente después de 1 segundo
- La lista de documentos se actualiza si estás mirando

---

## 🚨 Troubleshooting: ¿Si No Se Actualiza?

### **Paso 1: Verificar Consola**
Abre F12 → Console y busca:
- ✅ Ves `[v0] ✅ Status verified`? → Está funcionando
- ❌ Ves error rojo? → Problema de conexión/API

### **Paso 2: Verificar BD Directamente**
En Supabase:
1. Ve a `driver_documents` tabla
2. Busca el documento por ID
3. Verifica que `status` cambió a `rechazado`

Si cambió en BD pero no en UI:
→ El listener de Realtime no está conectado
→ Refresca la página (Ctrl+R)

### **Paso 3: Verificar Network**
En F12 → Network:
1. Filtra por XHR
2. Busca `status` request
3. Verifica que tiene status 200
4. Revisa response JSON

---

## 🔧 Cómo Debuggear

### **Ver Todos los Cambios:**
```javascript
// En consola:
localStorage.setItem('v0_debug_documents', 'true')
// Luego intenta cambiar estado
```

### **Simular Error (para testing):**
En el archivo `use-document-management.ts`, agrega:
```typescript
// Descomenta para simular error:
// throw new Error('Test error')
```

### **Ver BD Realtime:**
En Supabase:
1. Ve a `driver_documents`
2. Abre el documento
3. Edita el status manualmente
4. Deberías ver cambio en tu app en <1s

---

## 📊 Checklist: ¿Está Funcionando?

Cuando cambies estado, marca ✅ si ves:

- [ ] El API endpoint retorna status 200
- [ ] La consola muestra `[v0] ✅ Status verified`
- [ ] La BD cambió el valor (verifica en Supabase)
- [ ] El UI refleja el cambio en <2 segundos
- [ ] El modal se cierra automáticamente
- [ ] La lista se actualiza sin recargar

Si NO ves algunos de estos, hay un problema específico.

---

## 🔄 Flujo Completo (De Punto a Punto)

```
USUARIO: Click "Rechazado"
  ↓
FRONTEND: useDocumentManagement.changeStatus()
  ↓
NETWORK: PATCH /api/company/documents/[id]/status
  ↓
BACKEND: Validar estado → Actualizar BD
  ↓
ORCHESTRATOR: Emitir evento { type: 'document_status_changed', ... }
  ↓
DATABASE: Supabase trigger (si existe) se activa
  ↓
REALTIME: Supabase Realtime emite cambio a todos los clientes
  ↓
HOOK: verifyStatusUpdate() chequea 3 veces si se actualizó
  ↓
UI: Se actualiza automáticamente
  ↓
USUARIO: Ve "Rechazado" en pantalla
```

---

## 📝 Logs Esperados

### **Éxito:**
```
✅ Hook: changeStatus called
✅ Status change response: { status: 200 }
✅ Status changed successfully on server
✅ Status verified on attempt 1/3
```

### **Problema:**
```
❌ Hook: changeStatus called
❌ Error changing status: Network error
❌ Status update could not be verified
```

---

## 🎁 Bonus: Información Extra que Ahora Tienes

Cuando cambias estado, el sistema ahora **automáticamente**:

1. **Registra el cambio anterior** - Auditoría completa
2. **Emite al orquestrador** - Otros módulos se enteras
3. **Verifica la actualización** - No deja "cambios a medias"
4. **Registra timestamp** - Trazabilidad temporal
5. **Broadcast a clientes** - Otros usuarios ven cambio en tiempo real
6. **Genera alertas si es necesario** - Si es crítico, notifica

**Resultado:** Sistema inteligente y sincronizado al 100%

---

## 🧪 Testing Rápido

1. Abre DOS navegadores (o pestaña + navegador privado)
2. En ambos, accede al mismo documento
3. En uno, cambia estado a "Rechazado"
4. En el otro navegador, AUTOMÁTICAMENTE debería cambiar en <1s
5. Ambos ven el mismo estado sin refrescar

Si funciona → ¡Sistema en tiempo real funcionando! 🚀
