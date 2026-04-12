/**
 * DocuFleet Design System Tokens
 * Paleta de colores corporativa y tokens de diseño para Transportes Labbé
 */

export const ColorPalette = {
  // Neutrals - Fondo y texto
  background: {
    primary: '#f8f9fa',      // Fondo muy claro
    secondary: '#f5f5f5',    // Fondo alternativo
    tertiary: '#ffffff',     // Blanco puro
  },
  
  text: {
    primary: '#111827',      // Casi negro, headings
    secondary: '#374151',    // Gris oscuro, body
    tertiary: '#6b7280',     // Gris medio, labels
    light: '#9ca3af',        // Gris claro, hints
  },

  // Status Colors
  status: {
    ok: {
      light: '#dcfce7',      // bg
      main: '#10b981',       // primary
      dark: '#047857',       // hover
      text: '#065f46',       // text
    },
    risk: {
      light: '#fef3c7',      // bg
      main: '#f59e0b',       // primary
      dark: '#d97706',       // hover
      text: '#92400e',       // text
    },
    blocked: {
      light: '#fee2e2',      // bg
      main: '#dc2626',       // primary
      dark: '#b91c1c',       // hover
      text: '#7f1d1d',       // text
    },
    info: {
      light: '#dbeafe',      // bg
      main: '#3b82f6',       // primary
      dark: '#1d4ed8',       // hover
      text: '#1e3a8a',       // text
    },
  },

  // Primary Brand
  brand: {
    primary: '#1e40af',      // Azul profundo
    hover: '#1e3a8a',        // Azul más oscuro
    light: '#dbeafe',        // Azul muy claro
  },

  // Border and Divider
  border: {
    light: '#e5e7eb',        // Gris muy claro
    medium: '#d1d5db',       // Gris medio
    dark: '#9ca3af',         // Gris oscuro
  },

  // Gradients (para cards de estado)
  gradients: {
    ok: 'from-green-50 to-green-100',
    risk: 'from-amber-50 to-amber-100',
    blocked: 'from-red-50 to-red-100',
    info: 'from-blue-50 to-blue-100',
  }
}

/**
 * Typography Scale
 */
export const Typography = {
  // Headings
  h1: {
    size: '1.875rem',        // 30px
    lineHeight: '2.25rem',   // 36px
    fontWeight: 'bold',
  },
  h2: {
    size: '1.5rem',          // 24px
    lineHeight: '2rem',      // 32px
    fontWeight: 'bold',
  },
  h3: {
    size: '1.25rem',         // 20px
    lineHeight: '1.75rem',   // 28px
    fontWeight: 'semibold',
  },
  h4: {
    size: '1rem',            // 16px
    lineHeight: '1.5rem',    // 24px
    fontWeight: 'semibold',
  },

  // Body
  body: {
    lg: { size: '1rem', lineHeight: '1.5rem' },
    base: { size: '0.875rem', lineHeight: '1.25rem' },
    sm: { size: '0.75rem', lineHeight: '1rem' },
  },

  // Labels
  label: {
    size: '0.75rem',         // 12px
    lineHeight: '1rem',      // 16px
    fontWeight: 'semibold',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  },
}

/**
 * Spacing Scale
 */
export const Spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  xxl: '3rem',     // 48px
}

/**
 * Border Radius
 */
export const BorderRadius = {
  sm: '0.375rem',  // 6px - small buttons
  md: '0.5rem',    // 8px - default
  lg: '0.75rem',   // 12px - large cards
  xl: '1rem',      // 16px - extra large
  full: '9999px',  // full round
}

/**
 * Shadow System
 */
export const Shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
}

/**
 * Transitions
 */
export const Transitions = {
  fast: '150ms',
  base: '300ms',
  slow: '500ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
}
