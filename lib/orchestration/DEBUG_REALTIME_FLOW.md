# DEBUG: Flujo Completo de Sincronización en Tiempo Real

## Checklist de Debugging

Cuando cambias estado de documento, verifica ESTOS logs en F12 Console en este orden:

### 1. FRONTEND - Panel de Documento (document-management-panel.tsx)
```
[v0] Updating document status: { documentId, newStatus }
[v0] Dispatching documentStatusChanged event
```
**Significa:** Se envió la solicitud al servidor.

### 2. API - Endpoint Status (app/api/company/documents/[id]/status/route.ts)
```
[v0] Executing UPDATE query for document: [ID] to status: [STATUS]
[v0] UPDATE executed successfully: { ... rowsUpdated: 1 }
[v0] ⏳ Broadcast delay completed
```
**Significa:** La BD fue actualizada. Si ves `rowsUpdated: 0`, el documento NO existe.

### 3. REALTIME - Listener en Conductores Page
```
[v0] 📨 Document change received: { event: UPDATE, docId: [ID], status: [NEW] }
[v0] ⏳ Refetching drivers list...
```
**Significa:** Supabase transmitió el cambio. Si NO ves esto, realtime NO está configurado.

### 4. API DATA - Refetch (api/company/data)
```
[v0] Fetch fetch http://localhost:3000/api/company/data
```
**Significa:** SWR pidió datos nuevos.

### 5. FRONTEND - UI Update
```
[v0] Document status changed event, refetching drivers list...
```
**Significa:** La UI debería actualizar ahora. Si no pasa, es problema de React rendering.

---

## Problemas Comunes

### Problema: Cambias estado pero "No pasa nada"
**Causas posibles:**

1. **El cambio NO llega al servidor**
   - Abre DevTools → Network
   - Busca `PATCH /api/company/documents/[id]/status`
   - Si NO existe → El click no se envió

2. **El servidor actualiza pero Supabase realtime NO recibe**
   - Verifica logs del servidor (terminal)
   - Si ves `UPDATE executed successfully` pero NO ves `📨 Document change received`
   - **Problema:** Supabase Realtime no está escuchando
   - **Solución:** Revisa que el listener esté conectado (`SUBSCRIBED`)

3. **Realtime recibe pero UI no actualiza**
   - Abre Network tab
   - Busca segundo `GET /api/company/data`
   - Si NO existe → SWR no hizo refetch
   - **Problema:** El evento se capturó pero mutate() no se disparó
   - **Solución:** Verifica que `mutate()` se llamó en el callback

4. **Realtime conecta pero datos viejos persisten**
   - Abre DevTools → Application → Cookies
   - Si hay cookie stale → El cliente caché datos viejos
   - **Solución:** Limpia cache del navegador (Cmd+Shift+Delete)

---

## Test Paso a Paso

1. **Abre la página de conductores**
   - Verifica console: `✅ Successfully subscribed to driver_documents`

2. **En paralelo, abre Network tab**
   - Tab: Network (prepárate para ver requests)

3. **Cambia estado de 1 documento**
   - Busca `PATCH /api/company/documents/.../status` en Network
   - Verifica respuesta: `"success": true`

4. **Mira logs en Console**
   - Deberías ver: `📨 Document change received`
   - Luego: `⏳ Refetching drivers list`
   - Luego: `GET /api/company/data` en Network tab

5. **Verifica UI**
   - El documento debe cambiar de estado en <1 segundo

---

## Configuración Esperada

Para que funcione tiempo real:

1. ✅ Supabase Realtime debe estar HABILITADO en project settings
2. ✅ La tabla `driver_documents` debe tener RLS pero la política debe permitir SELECT/UPDATE
3. ✅ El cliente anon_key debe tener permisos de lectura en cambios
4. ✅ El listener debe usar channel name único (usamos `public:driver_documents`)
5. ✅ El servidor debe actualizar la BD con admin client

Si algo falla, el sistema cae a modo manual (espera a que reinicies servidor).

---

## Logs Esperados en Consola

### Éxito Total
```
[v0] Setting up realtime listener on conductores page
[v0] Subscription status: SUBSCRIBED
[v0] ✅ Successfully subscribed to driver_documents
[v0] 📨 Document change received: { event: UPDATE, docId: uuid-123, status: aprobado }
[v0] ⏳ Refetching drivers list...
```

### Fallo (Realtime no funciona)
```
[v0] Setting up realtime listener on conductores page
[v0] Subscription status: CHANNEL_ERROR
[v0] ❌ Channel error, retrying in 3s...
```
En este caso, falla a modo manual y necesita reinicio.

---

## Último Recurso: Reinicio

Si todo falla:
1. Verifica que Supabase Realtime está ON en Settings
2. Verifica que table `driver_documents` existe
3. Reinicia servidor: `npm run dev`
4. Limpia cache: Cmd+Shift+Delete
5. Prueba de nuevo
