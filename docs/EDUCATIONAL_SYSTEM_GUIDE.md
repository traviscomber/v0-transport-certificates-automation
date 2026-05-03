# 📚 GUÍA COMPLETA DE EDUCACIÓN EN LABBE

## Propósito
Este documento explica cómo LABBE proporciona educación continua a los usuarios de forma integrada en la interfaz.

---

## 1️⃣ COMPONENTES EDUCATIVOS DISPONIBLES

### A. EducationalTooltip (Tooltip Educativo)
**Dónde usar:** En cualquier campo, botón o concepto que el usuario pueda no entender

**Cómo funciona:**
- Ícono azul con "i" de información
- Al pasar el mouse: muestra explicación
- En móvil: se abre al hacer clic

**Ejemplo de código:**
```tsx
<EducationalTooltip 
  title="¿Qué es un Subcontratista?"
  description="Un subcontratista es una empresa que trabaja bajo contrato con tu empresa. Aparece aquí para que la supervises."
/>
```

---

### B. TabEducationalGuide (Guía por Tab)
**Dónde usar:** Al inicio de cada tab/sección

**Características:**
- Se collapsa para no ocupar espacio
- Explica el propósito del tab
- Incluye tips y ejemplos
- Icono de bombilla para identificarla

**Ejemplo:**
```tsx
<TabEducationalGuide
  title="¿Qué es la Torre de Control?"
  content="Es tu panel central de monitoreo donde ves el estado general de todas tus operaciones..."
  tips={['Usa las tarjetas para monitorear estado', 'Los números en rojo indican problemas']}
  examples={['Si ves 5 Documentos Vencidos, haz clic para renovarlos']}
/>
```

---

### C. EducationalModal (Modal Educativo)
**Dónde usar:** Para conceptos complejos que necesitan más espacio

**Características:**
- Abre en modal grande
- Tiene secciones expandibles
- Incluye ejemplos y tips
- Fácil de cerrar

**Ejemplo:**
```tsx
const { isOpen, open, close } = useEducationalModal()

<button onClick={open}>Aprender sobre Cumplimiento</button>
<EducationalModal 
  isOpen={isOpen}
  onClose={close}
  title="¿Qué es Cumplimiento Normativo?"
  sections={[
    {heading: '¿Por qué es importante?', content: 'Asegura que tu operación siga todas las leyes...'},
    {heading: '¿Qué se verifica?', content: 'Licencias, permisos, certificados...'}
  ]}
/>
```

---

## 2️⃣ DÓNDE APLICAR EDUCACIÓN EN CADA TAB

### Tab: Control Tower
- **Guía al inicio:** Explicar qué es
- **Tooltips en:** Cada tarjeta de estado, gráficos, números
- **Modal para:** Cómo leer el Score de Cumplimiento

### Tab: Subcontractistas
- **Guía al inicio:** Qué son y para qué sirven
- **Tooltips en:** Barra de búsqueda, filtros, campos de datos
- **Modal para:** Cómo agregar nuevo subcontratista

### Tab: Conductores
- **Guía al inicio:** Qué datos se guardan
- **Tooltips en:** RUT, proveedor, patente, licencia
- **Modal para:** Proceso de registración

### Tab: Documentos
- **Guía al inicio:** Tipos de documentos y vigencia
- **Tooltips en:** Cada tipo de documento, fechas
- **Modal para:** Cómo funciona OCR y validación

### Tab: Equipo
- **Guía al inicio:** Roles y permisos
- **Tooltips en:** Cada rol, permisos específicos
- **Modal para:** Cómo invitar usuarios

### Tab: Alertas
- **Guía al inicio:** Qué son y por qué importan
- **Tooltips en:** Nivel de prioridad, tipo de alerta
- **Modal para:** Cómo configurar alertas personalizadas

---

## 3️⃣ BASE DE DATOS EDUCATIVA

Existe un archivo central con todo el contenido:
- `/lib/educational-content.ts` - Contenido por tab
- `/lib/educational-explanations.ts` - Explicaciones de elementos UI

Para agregar nueva explicación:
1. Abre el archivo correspondiente
2. Agrega tu contenido en la estructura
3. Usa en el componente

---

## 4️⃣ MEJORES PRÁCTICAS

✅ **DO:**
- Mantén explicaciones cortas (1-2 líneas)
- Usa lenguaje simple, sin jerga
- Da ejemplos reales y aplicables
- Coloca tooltips en lugares donde el usuario lo espera

❌ **DON'T:**
- No hagas explicaciones muy largas en tooltips (usa modal)
- No dejes funcionalidad sin explicación
- No uses términos técnicos sin definir
- No saturares el UI con íconos de información

---

## 5️⃣ FLUJO DE USUARIO EDUCADO

```
Usuario llega a tab
    ↓
Ve guía colapsible → Lee qué hace la sección
    ↓
Hoy clic en un elemento → Ve tooltip con explicación
    ↓
Quiere aprender más → Abre modal educativo
    ↓
Lee ejemplos → Entiende cómo usar
    ↓
Toma acción informado ✓
```

---

## 6️⃣ EJEMPLOS DE IMPLEMENTACIÓN

### Agregar Tooltip a un Botón
```tsx
import { EducationalTooltip } from '@/components/educational-tooltip'

<div className="flex items-center gap-2">
  <button>Agregar Subcontratista</button>
  <EducationalTooltip 
    title="¿Qué es un Subcontratista?"
    description="Una empresa que trabaja bajo contrato con tu empresa..."
  />
</div>
```

### Agregar Guía a un Tab
```tsx
import { TabEducationalGuide } from '@/components/tab-educational-guide'
import { educationalContent } from '@/lib/educational-content'

{activeTab === 'subcontractors' && (
  <>
    <TabEducationalGuide {...educationalContent.subcontractors} />
    {/* Contenido del tab aquí */}
  </>
)}
```

---

## 7️⃣ MANTENIMIENTO

La educación es un proceso continuo:
- Revisa regularmente si el contenido está actualizado
- Agrega explicaciones para nuevas funciones
- Recolecta feedback de usuarios
- Simplifica explicaciones complejas

---

## 📞 SOPORTE

Para agregar nuevas explicaciones educativas:
1. Identifica qué necesita ser explicado
2. Escribe contenido claro
3. Agrega a `/lib/educational-content.ts` o `/lib/educational-explanations.ts`
4. Usa el componente apropiado en el UI
5. Prueba en diferentes dispositivos

El objetivo es que **LABBE sea accesible incluso para usuarios no técnicos**.
