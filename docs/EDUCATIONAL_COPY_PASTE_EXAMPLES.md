# 🔧 EJEMPLOS COPY-PASTE - SISTEMA EDUCATIVO LABBE

## Propósito
Ejemplos listos para copiar y pegar. Cada uno resuelve un caso de uso real.

---

## EJEMPLO 1: Agregar Tooltip a un Botón

```tsx
import { EducationalTooltip } from '@/components/educational-tooltip'

export function MiComponente() {
  return (
    <div className="flex items-center gap-2">
      <button className="px-4 py-2 bg-blue-600 rounded">
        Agregar Nuevo
      </button>
      <EducationalTooltip
        title="¿Qué es agregar nuevo?"
        description="Haz clic aquí para registrar una nueva persona o documento en el sistema. Se abrirá un formulario donde completarás todos los datos necesarios."
      />
    </div>
  )
}
```

---

## EJEMPLO 2: Crear Guía para un Nuevo Tab

```tsx
import { TabEducationalGuide } from '@/components/tab-educational-guide'

export function MiNuevoTab() {
  return (
    <>
      <TabEducationalGuide
        title="¿Qué es esta sección?"
        content="Aquí gestiono todos los... y puedo hacer seguimiento de..."
        tips={[
          'Usa búsqueda rápida escribiendo nombre o RUT',
          'Los filtros te ayudan a organizar por categoría',
          'Haz clic en cualquier elemento para ver detalles',
          'Puedes editar información directamente'
        ]}
        examples={[
          'Ejemplo 1: Busca "Ruben" para encontrar a Ruben Marchant',
          'Ejemplo 2: Filtra por región "Metropolitana"',
          'Ejemplo 3: Haz clic en un nombre para editar sus datos'
        ]}
      />
      
      {/* Tu contenido aquí */}
    </>
  )
}
```

---

## EJEMPLO 3: Modal Educativo para Concepto Complejo

```tsx
import { EducationalModal, useEducationalModal } from '@/components/educational-modal'

export function ExplicarCumplimiento() {
  const { isOpen, open, close } = useEducationalModal()

  return (
    <>
      <button
        onClick={open}
        className="text-blue-500 hover:underline"
      >
        ¿Qué es Cumplimiento Normativo?
      </button>

      <EducationalModal
        isOpen={isOpen}
        onClose={close}
        title="¿Qué es Cumplimiento Normativo?"
        sections={[
          {
            heading: '¿Por qué es importante?',
            content: 'El cumplimiento normativo asegura que tu operación siga todas las leyes y regulaciones del país. Si no cumples, puedes recibir multas o perder permisos.'
          },
          {
            heading: '¿Qué verifica LABBE?',
            content: 'LABBE verifica automáticamente que: 1) Todas las licencias de conducir estén vigentes, 2) Los permisos circulatorios estén al día, 3) Las revisiones técnicas sean actuales.'
          },
          {
            heading: '¿Cómo me ayuda?',
            content: 'El sistema te alerta antes de que algo venza, calcula un "Score de Cumplimiento" y te muestra exactamente qué necesita renovarse.'
          }
        ]}
        examples={[
          'Una licencia de conducir que vence en 5 años - LABBE te avisa 1 mes antes',
          'Un permiso de circulación que debe renovarse cada año - LABBE lo marca en rojo cuando vence',
          'Un conductor que no tiene documento requerido - LABBE lo marca como "Incompleto"'
        ]}
        tips={[
          'Revisa tu Score de Cumplimiento cada semana',
          'Actúa inmediatamente si ves alertas rojas',
          'Planifica renovaciones antes de que venza',
          'El 100% de cumplimiento significa operación segura'
        ]}
      />
    </>
  )
}
```

---

## EJEMPLO 4: Tooltip en Campo de Formulario

```tsx
import { EducationalTooltip } from '@/components/educational-tooltip'

export function FormularioSubcontratista() {
  return (
    <div className="space-y-4">
      <div>
        <label className="block font-semibold mb-2">
          RUT
          <EducationalTooltip
            title="¿Qué es el RUT?"
            description="Es el Rut Único Tributario. Número único de identidad para empresas en Chile. Formato: XX.XXX.XXX-X"
          />
        </label>
        <input
          type="text"
          placeholder="XX.XXX.XXX-X"
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block font-semibold mb-2">
          Razón Social
          <EducationalTooltip
            title="¿Qué es la Razón Social?"
            description="Es el nombre oficial de la empresa registrado en el Servicio de Impuestos Internos. Debe coincidir exactamente con tu documentación legal."
          />
        </label>
        <input
          type="text"
          placeholder="Nombre de la empresa"
          className="w-full px-3 py-2 border rounded"
        />
      </div>
    </div>
  )
}
```

---

## EJEMPLO 5: Guía Completa en Control Tower

```tsx
import { TabEducationalGuide } from '@/components/tab-educational-guide'
import { educationalContent } from '@/lib/educational-content'

export function ControlTowerTab() {
  return (
    <div>
      {/* Guía educativa al inicio */}
      <TabEducationalGuide {...educationalContent.controlTower} />

      {/* Tarjetas de estado */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="p-4 bg-slate-800 rounded border border-slate-700">
          <div className="text-sm text-slate-400">Conductores Activos</div>
          <div className="text-3xl font-bold text-green-400">45</div>
        </div>
        <div className="p-4 bg-slate-800 rounded border border-slate-700">
          <div className="text-sm text-slate-400">Documentos Vencidos</div>
          <div className="text-3xl font-bold text-red-400">3</div>
        </div>
      </div>
    </div>
  )
}
```

---

## EJEMPLO 6: Lista con Tooltips en Cada Columna

```tsx
import { EducationalTooltip } from '@/components/educational-tooltip'

export function TablaDrivers() {
  const drivers = [
    { rut: '18.012.757-7', nombre: 'Ruben Marchant', licencia: 'B1', patente: 'XW7026' }
  ]

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b">
          <th className="text-left">
            RUT
            <EducationalTooltip
              title="RUT del Conductor"
              description="Cédula de identidad única del conductor. Se usa para identificarlo en todo el sistema."
            />
          </th>
          <th className="text-left">
            Nombre
            <EducationalTooltip
              title="Nombre del Conductor"
              description="Nombre completo según su cédula de identidad."
            />
          </th>
          <th className="text-left">
            Licencia
            <EducationalTooltip
              title="Clase de Licencia"
              description="B1 = Auto, C = Camión, D = Moto. Determina qué vehículos puede manejar."
            />
          </th>
          <th className="text-left">
            Patente
            <EducationalTooltip
              title="Patente del Vehículo"
              description="Número de placa. Identifica el vehículo que maneja el conductor."
            />
          </th>
        </tr>
      </thead>
      <tbody>
        {drivers.map(driver => (
          <tr key={driver.rut} className="border-b">
            <td>{driver.rut}</td>
            <td>{driver.nombre}</td>
            <td>{driver.licencia}</td>
            <td>{driver.patente}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

---

## EJEMPLO 7: Infobox Educativo

```tsx
export function InfoboxEducativo() {
  return (
    <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded">
      <div className="flex gap-3">
        <div className="text-blue-400 text-2xl">ℹ️</div>
        <div>
          <h3 className="font-semibold text-blue-300 mb-1">¿Sabías que?</h3>
          <p className="text-slate-300 text-sm">
            LABBE verifica automáticamente la vigencia de documentos cada día y te avisa si algo próximo a vencer o ya venció. Esto te ayuda a mantener tu operación siempre en orden.
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

## EJEMPLO 8: Barra de Búsqueda con Ayuda

```tsx
import { EducationalTooltip } from '@/components/educational-tooltip'
import { Search } from 'lucide-react'

export function SearchBarEducativa() {
  return (
    <div className="flex gap-2 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Busca por nombre, RUT o empresa..."
          className="w-full pl-10 pr-3 py-2 border rounded bg-slate-800 text-white"
        />
      </div>
      <EducationalTooltip
        title="¿Cómo buscar?"
        description="Escribe cualquier dato: nombre (ej: Ruben), RUT (ej: 18.012.757-7) o empresa (ej: Transportes). La búsqueda es en tiempo real."
      />
    </div>
  )
}
```

---

## EJEMPLO 9: Formulario Completamente Educado

```tsx
import { EducationalTooltip } from '@/components/educational-tooltip'
import { EducationalModal, useEducationalModal } from '@/components/educational-modal'

export function FormularioEducado() {
  const { isOpen, open, close } = useEducationalModal()

  return (
    <form className="space-y-4">
      <div>
        <label className="block mb-2 font-semibold">
          Nombre Completo
          <EducationalTooltip
            title="Nombre"
            description="Ingresa el nombre completo según la cédula de identidad."
          />
        </label>
        <input type="text" className="w-full px-3 py-2 border rounded" />
      </div>

      <div>
        <label className="block mb-2 font-semibold">
          RUT
          <EducationalTooltip
            title="RUT"
            description="Formato: XX.XXX.XXX-X. Ej: 18.012.757-7"
          />
        </label>
        <input type="text" className="w-full px-3 py-2 border rounded" />
      </div>

      <button onClick={open} className="text-blue-500 text-sm">
        ¿Necesitas ayuda para completar este formulario?
      </button>

      <EducationalModal
        isOpen={isOpen}
        onClose={close}
        title="Cómo Completar el Formulario"
        sections={[
          {
            heading: 'Paso 1: Nombre',
            content: 'Usa el nombre exacto como aparece en tu cédula de identidad.'
          },
          {
            heading: 'Paso 2: RUT',
            content: 'Ingresa el RUT con puntos y guión. Ej: 18.012.757-7'
          }
        ]}
      />
    </form>
  )
}
```

---

## EJEMPLO 10: Tarjeta Educativa en Dashboard

```tsx
import { Lightbulb } from 'lucide-react'

export function TarjetaEducativa() {
  return (
    <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-6">
      <div className="flex gap-4">
        <Lightbulb className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-bold text-blue-300 mb-2">💡 Tip del Día</h3>
          <p className="text-slate-300 text-sm mb-3">
            ¿Sabías que puedes exportar toda la lista de conductores a Excel? Usa el botón "Exportar" en la esquina superior derecha.
          </p>
          <button className="text-xs px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition">
            Aprender más
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

- [ ] Identifica dónde agregar educación
- [ ] Elige el componente correcto (Tooltip, Guide, o Modal)
- [ ] Escribe contenido claro y conciso
- [ ] Prueba en móvil y desktop
- [ ] Valida que el contenido sea correcto
- [ ] Pide feedback a usuarios
- [ ] Ajusta según feedback

---

**¡Listo!** Ahora tienes 10 ejemplos listos para copiar y pegar en tu proyecto.
