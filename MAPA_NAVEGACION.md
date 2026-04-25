# 🗺️ Mapa de Navegación — N3uralia ERP Minería

## Acceso Rápido a Todos los Módulos

### URL Base
```
https://tu-dominio.com/dashboard/company
```

---

## 📍 Rutas Completas

### Centro de Operaciones (Principal)
- **URL:** `/dashboard/company`
- **Descripción:** Dashboard principal con métricas mineras en tiempo real
- **Acceso:** Principal → Centro de Operaciones

---

### 🔴 OPERACIÓN CRÍTICA

#### 1. Producción
- **URL:** `/dashboard/company/produccion`
- **Icon:** ⚡ (Zap)
- **Descripción:** Control de equipos y líneas de producción
- **Acceso:** Sidebar → Producción

#### 2. Mantención
- **URL:** `/dashboard/company/mantencion`
- **Icon:** 🔧 (Wrench)
- **Descripción:** Gestión de mantenimientos predictivos
- **Acceso:** Sidebar → Mantención

#### 3. Bodega
- **URL:** `/dashboard/company/bodega`
- **Icon:** 📦 (Package)
- **Descripción:** Inventario de repuestos y materiales
- **Acceso:** Sidebar → Bodega

#### 4. HSE / Seguridad
- **URL:** `/dashboard/company/hse`
- **Icon:** 🛡️ (Shield)
- **Descripción:** Gestión de seguridad y salud ocupacional
- **Acceso:** Sidebar → HSE / Seguridad

#### 5. Documentos
- **URL:** `/dashboard/company/documentos`
- **Icon:** 📄 (FileText)
- **Descripción:** Control de documentación operacional
- **Acceso:** Sidebar → Documentos

---

### 💼 GESTIÓN EMPRESARIAL

#### 6. Compras
- **URL:** `/dashboard/company/compras`
- **Icon:** 🛒 (ShoppingCart)
- **Descripción:** Gestión de órdenes de compra
- **Acceso:** Sidebar → Compras

#### 7. Finanzas
- **URL:** `/dashboard/company/finanzas`
- **Icon:** 💵 (DollarSign)
- **Descripción:** Control financiero y presupuestario
- **Acceso:** Sidebar → Finanzas

#### 8. Reportes IA
- **URL:** `/dashboard/company/reportes`
- **Icon:** 📊 (BarChart3)
- **Descripción:** Análisis impulsados por IA con 4 tipos
- **Acceso:** Sidebar → Reportes IA

#### 9. Usuarios
- **URL:** `/dashboard/company/usuarios`
- **Icon:** 👥 (Users)
- **Descripción:** Gestión de accesos y permisos
- **Acceso:** Sidebar → Usuarios

---

### 🛠️ HERRAMIENTAS

#### 10. Alertas
- **URL:** `/dashboard/company/alertas`
- **Icon:** ⚠️ (AlertTriangle)
- **Descripción:** Panel centralizado de alertas en tiempo real
- **Acceso:** Sidebar → Alertas

#### 11. Asistente IA
- **URL:** `/dashboard/company/asistente`
- **Icon:** 🤖 (Brain)
- **Descripción:** IA operacional 24/7
- **Acceso:** Chat flotante (global) o Sidebar → Asistente IA

---

## 🎯 Flujos de Acceso Rápido

### Para Gerente General
1. Abre **Centro de Operaciones** → Revisa métricas
2. Va a **Reportes IA** → "Resumen Ejecutivo"
3. Pregunta al **Asistente IA** → "¿Qué alertas críticas tenemos?"

### Para Supervisor de Operaciones
1. Abre **Centro de Operaciones** → Busca "Atención Requerida"
2. Va a **Mantención** → Ve equipos con mantenimiento atrasado
3. Va a **Bodega** → Verifica si hay repuestos disponibles
4. Va a **Compras** → Crea orden si falta stock

### Para Jefe de HSE
1. Abre **HSE / Seguridad** → Revisa incidentes
2. Consulta **Reportes IA** → "Análisis de Riesgos"
3. Va a **Documentos** → Verifica certificaciones al día

### Para Ejecutivo Financiero
1. Abre **Finanzas** → Revisa presupuestos y costos
2. Va a **Reportes IA** → "Resumen Ejecutivo"
3. Pregunta al **Asistente IA** → "¿Cuál es mi costo operacional vs presupuesto?"

---

## 📱 Acceso Móvil

Todos los módulos son responsivos y accesibles desde:
- **Tablet:** Navegación completa (2-3 columnas)
- **Mobile:** Navegación colapsada en hamburguesa
- **Desktop:** Vista completa con sidebar expandido

---

## 🔐 Control de Acceso por Rol

| Rol | Centro | Operación | Gestión | Herramientas |
|-----|--------|-----------|---------|--------------|
| **Gerente General** | ✅ | ✅ Todos | ✅ Todos | ✅ Todos |
| **Supervisor Op.** | ✅ | ✅ Todos | ⚠️ Parcial | ✅ Alertas |
| **Operador** | ✅ | ✅ Prod/Bodega | ❌ | ✅ Alertas |
| **HSE Manager** | ✅ | ✅ HSE/Doc | ❌ | ✅ Alertas |
| **Analista Fin.** | ✅ | ❌ | ✅ Finanzas | ✅ Reportes |

---

## 🎯 Atajos de Teclado

| Atajo | Función |
|-------|---------|
| `Ctrl + O` | Ir a Centro de Operaciones |
| `Ctrl + R` | Ir a Reportes IA |
| `Ctrl + A` | Ir a Alertas |
| `Ctrl + I` | Abrir Asistente IA |
| `Ctrl + /` | Mostrar esta guía |

---

## 📊 Matriz de Dependencias

```
Centro de Operaciones
├─ Datos de: Producción, Mantención, Bodega, HSE, Documentos
├─ Muestra: Alertas críticas de todos los módulos
└─ Permite: Navegar directamente a módulo de origen

Reportes IA
├─ Consume: Datos de todos los módulos
├─ Requiere: OpenAI API (OPENAI_API_KEY)
└─ Genera: 4 tipos de análisis ejecutivos

Asistente IA
├─ Acceso: Global (chat flotante)
├─ Requiere: OpenAI API (OPENAI_API_KEY)
└─ Responde: Preguntas sobre cualquier módulo

Bodega
├─ Conecta con: Producción (repuestos usados)
├─ Integra con: Compras (órdenes automáticas)
└─ Alerta a: Usuarios (stock bajo)

Compras
├─ Recibe: Órdenes de Bodega
├─ Integra con: Finanzas (costos)
└─ Reporta a: Reportes IA
```

---

## 🌐 Desde la Landing Page

### Rutas Públicas
- **URL:** `/` (Landing)
- **Navegación:**
  - Logo → Inicio
  - "Ir al Dashboard" → `/dashboard/company`
  - "Ver Demo" → `/auth/login`
  - Footer links → Módulos específicos

### Autenticación
- **Login:** `/auth/login`
- **Register:** `/auth/register`
- **Reset Password:** `/auth/reset-password`

---

## 🔄 Flujo de Sesión

```
1. Usuario accede a /
2. Si no autenticado → Muestra landing
3. Click en "Ir al Dashboard" → Redirige a /auth/login
4. Login exitoso → /dashboard/company
5. Navegación dentro del dashboard
6. Logout → Vuelve a /
```

---

## 📝 Bookmarks Recomendados

Guardar en favoritos:
```
Centro de Operaciones
https://tu-dominio.com/dashboard/company

Reportes IA
https://tu-dominio.com/dashboard/company/reportes

Alertas
https://tu-dominio.com/dashboard/company/alertas

Mantenimiento
https://tu-dominio.com/dashboard/company/mantencion

Bodega
https://tu-dominio.com/dashboard/company/bodega
```

---

## 🚨 Rutas de Emergencia

**Si hay alerta crítica:**
1. Abre **Alertas** directamente: `/dashboard/company/alertas`
2. Filtra por "CRÍTICA"
3. Haz clic en alerta para ver detalles
4. Navega al módulo relacionado desde la alerta

**Si necesitas análisis rápido:**
1. Abre **Reportes**: `/dashboard/company/reportes`
2. Selecciona "Alertas Críticas"
3. Haz clic en "Generar Análisis"
4. Espera resultado (2-3 minutos)

---

## 📞 Soporte de Navegación

**¿Dónde encuentro...?**

| Busco | Voy a |
|-------|-------|
| Estado de equipos | Centro Operaciones → Producción |
| Mantenimientos atrasados | Mantención |
| Repuestos faltantes | Bodega |
| Certificaciones vencidas | Documentos |
| Órdenes de compra | Compras |
| Costos vs presupuesto | Finanzas |
| Análisis de riesgos | Reportes IA |
| Incidentes de seguridad | HSE / Seguridad |
| Respuesta rápida | Asistente IA |
| Alertas críticas | Alertas |

---

## ✅ Checklist de Navegación Inicial

- [ ] Accediste a Centro de Operaciones
- [ ] Exploraste todos los módulos en el sidebar
- [ ] Abriste un reporte IA
- [ ] Hiciste una pregunta al Asistente IA
- [ ] Revisaste una alerta
- [ ] Guardaste los bookmarks importantes
- [ ] Identificaste tu rol de usuario

---

**Bienvenido a N3uralia ERP Minería. Tu mapa de navegación está completo.**

*De la operación en terreno a la decisión ejecutiva.*
