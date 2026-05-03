/**
 * Authentication validation utilities
 * Centralized validation for auth forms
 */

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation
export const validatePassword = (password: string): ValidationError[] => {
  const errors: ValidationError[] = []

  if (password.length < 6) {
    errors.push({
      field: 'password',
      message: 'La contraseña debe tener al menos 6 caracteres',
    })
  }

  return errors
}

// Login form validation
export const validateLogin = (
  email: string,
  password: string
): ValidationResult => {
  const errors: ValidationError[] = []

  if (!email) {
    errors.push({
      field: 'email',
      message: 'El correo es requerido',
    })
  } else if (!validateEmail(email)) {
    errors.push({
      field: 'email',
      message: 'Ingresa un correo válido',
    })
  }

  if (!password) {
    errors.push({
      field: 'password',
      message: 'La contraseña es requerida',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Register form validation
export const validateRegister = (
  email: string,
  password: string,
  confirmPassword: string,
  fullName: string,
  role: string
): ValidationResult => {
  const errors: ValidationError[] = []

  if (!fullName || fullName.trim().length === 0) {
    errors.push({
      field: 'fullName',
      message: 'El nombre es requerido',
    })
  }

  if (!email) {
    errors.push({
      field: 'email',
      message: 'El correo es requerido',
    })
  } else if (!validateEmail(email)) {
    errors.push({
      field: 'email',
      message: 'Ingresa un correo válido',
    })
  }

  if (!password) {
    errors.push({
      field: 'password',
      message: 'La contraseña es requerida',
    })
  } else if (password.length < 6) {
    errors.push({
      field: 'password',
      message: 'La contraseña debe tener al menos 6 caracteres',
    })
  }

  if (password !== confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Las contraseñas no coinciden',
    })
  }

  if (!role) {
    errors.push({
      field: 'role',
      message: 'Debes seleccionar un rol',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Error message parser for Supabase errors
export const parseAuthError = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes('invalid login credentials')) {
      return 'Correo o contraseña incorrectos'
    }
    if (message.includes('user already exists')) {
      return 'Este correo ya está registrado'
    }
    if (message.includes('email not confirmed')) {
      return 'Por favor, verifica tu correo antes de iniciar sesión'
    }
    if (message.includes('password')) {
      return 'Error con la contraseña'
    }
    if (message.includes('network')) {
      return 'Error de conexión. Intenta nuevamente.'
    }
    if (message.includes('database error') || message.includes('finding user') || message.includes('profile not found')) {
      return 'Error al procesar tu registro. Por favor intenta nuevamente en unos momentos.'
    }

    return error.message
  }

  if (typeof error === 'string') {
    const msg = error.toLowerCase()
    if (msg.includes('database') || msg.includes('finding user') || msg.includes('profile')) {
      return 'Error al procesar tu registro. Por favor intenta nuevamente en unos momentos.'
    }
    return error
  }

  return 'Ocurrió un error. Intenta nuevamente.'
}
