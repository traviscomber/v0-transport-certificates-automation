# GUÍA DE ONBOARDING PARA EJECUTIVOS LABBE

## ¿QUÉ ES EL ONBOARDING?

El sistema de onboarding es una experiencia educativa diseñada específicamente para ejecutivos de transportes de LABBE. Cuando un usuario entra al sistema por primera vez, ve:

1. **Modal de bienvenida** con 7 pasos
2. **Explicación de cada sección** del sistema
3. **Guías colapsibles** dentro de cada tab
4. **Tooltips educativos** en elementos principales

## COMPONENTES DEL SISTEMA

### 1. OnboardingModal (`components/onboarding-modal.tsx`)
Modal profesional que aparece EN PRIMERA VISITA mostrando:
- Paso 1: Bienvenida a DocuFleet
- Paso 2-7: Explicación de cada sección (Control Tower, Conductores, Subcontratistas, etc.)
- Navegación: Anterior, Siguiente, Finalizar
- Indicador de progreso (ej: 1/7, 2/7, etc.)

### 2. SectionGuide (`components/section-guide.tsx`)
Guía colapsible que aparece EN CADA TAB mostrando:
- Título de la sección
- Descripción general
- Lista de elementos con explicaciones

### 3. OnboardingContent.json (`public/onboarding-content.json`)
Base de datos centralizada con:
- 7 pasos del onboarding inicial
- Explicaciones de 6 secciones principales
- 25+ elementos explicados

## CÓMO FUNCIONA

### Primera Visita del Usuario

```
1. Usuario ingresa al dashboard
   ↓
2. Se carga OnboardingModal
   ↓
3. Si es primera vez (no tiene localStorage 'onboarding_shown'):
   - Modal aparece automáticamente
   - Usuario ve 7 pasos educativos
   ↓
4. Usuario navega por los pasos
   ↓
5. Al finalizar, se guarda en localStorage
   - localStorage.setItem('onboarding_shown', 'true')
   ↓
6. Próximas visitas, modal NO aparece (pero puede reiniciarse)
```

### Uso del SectionGuide

Cuando está EN una sección específica:

```
1. Se carga SectionGuide con el sectionKey
   ↓
2. Obtiene contenido de onboarding-content.json
   ↓
3. Muestra guía colapsible con:
   - Título de sección
   - Descripción
   - Lista de elementos explicados
   ↓
4. Usuario puede expandir/contraer la guía
```

## IMPLEMENTACIÓN EN EL CÓDIGO

### Agregando OnboardingModal

```tsx
// En el layout o página principal
import { OnboardingModal } from '@/components/onboarding-modal'

export default function Page() {
  return (
    <div>
      <OnboardingModal />
      {/* resto del contenido */}
    </div>
  )
}
```

### Agregando SectionGuide

```tsx
// En una sección específica (ej: Control Tower)
import { SectionGuide } from '@/components/section-guide'

export function ControlTower() {
  return (
    <div>
      <SectionGuide sectionKey="control-tower" />
      {/* contenido de la sección */}
    </div>
  )
}
```

## AGREGAR NUEVO CONTENIDO

### Opción 1: Editar onboarding-content.json

```json
{
  "onboarding_steps": [
    {
      "id": 8,
      "title": "Nueva Sección",
      "description": "Descripción corta",
      "icon": "IconName",
      "content": "Explicación detallada"
    }
  ],
  "section_explanations": {
    "nueva-seccion": {
      "title": "Nueva Sección - Descripción",
      "description": "Qué es esta sección",
      "items": [
        {
          "label": "Elemento 1",
          "explanation": "Qué es y para qué sirve"
        }
      ]
    }
  }
}
```

### Opción 2: Mantener archivos TypeScript

Si se modifica el onboarding-content.json, se actualiza automáticamente en el UI.

## CARACTERÍSTICAS PRINCIPALES

✅ **Primer Uso**: Modal educativo automático
✅ **Según Necesario**: Guías colapsibles en cada sección
✅ **Reiniciable**: Usuario puede ver onboarding nuevamente
✅ **Offline**: Todo cargado localmente (excepto JSON)
✅ **Responsive**: Funciona en mobile y desktop

## PARA EL EQUIPO LABBE

### Editar Contenido
1. Abre `/public/onboarding-content.json`
2. Modifica textos, descripción o agregaintegrateionéss
3. Recarga el navegador

### Reiniciar Onboarding
Para testing, ejecuta en consola:
```javascript
localStorage.removeItem('onboarding_shown')
```

### Agregar Nueva Sección
1. Agrega entrada en `onboarding_steps` (si es nuevo paso)
2. Agrega entrada en `section_explanations` con clave única
3. Usa `<SectionGuide sectionKey="tu-clave" />` en el componente

## DATOS TÉCNICOS

- **Almacenamiento**: localStorage para control de visto
- **Datos**: JSON estático en `/public`
- **Componentes**: React 'use client' con hooks
- **Tamaño**: ~20KB (onboarding-content.json)
- **Performance**: Carga lazy, sin impacto en bundle

## PRÓXIMAS MEJORAS

- Analitica de cuánto tiempo está en cada paso
- Saltar pasos específicos
- Versiones en otros idiomas
- Video tutorials integrados
- Tooltips contextuales adicionales
