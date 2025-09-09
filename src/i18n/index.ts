/**
 * Localization System
 * 
 * Sistema de localización simple basado en configuración
 * - Soporte para español e inglés
 * - Configurado via config.locale
 * - Sin dependencias externas
 */

import { config } from '@/config'

type Locale = 'es-MX' | 'en-US'
type TranslationKey = keyof typeof translations.es

const translations = {
  es: {
    // Auth Layout
    'auth.title': 'Agent Hub',
    'auth.subtitle': 'Plataforma de gestión de chat multicanal',
    
    // Login
    'login.title': 'Inicia sesión en tu cuenta',
    'login.email': 'Correo electrónico',
    'login.password': 'Contraseña',
    'login.submit': 'Iniciar Sesión',
    'login.noAccount': '¿No tienes cuenta?',
    'login.createOne': 'Crear una',
    
    // Signup
    'signup.title': 'Crea tu cuenta',
    'signup.subtitle': 'Configura tu instancia de Agent Hub creando una cuenta de administrador',
    'signup.username': 'Nombre de usuario',
    'signup.email': 'Correo electrónico',
    'signup.password': 'Contraseña',
    'signup.confirmPassword': 'Confirmar contraseña',
    'signup.submit': 'Crear Cuenta',
    'signup.hasAccount': '¿Ya tienes cuenta?',
    'signup.signIn': 'Iniciar sesión',
    
    // Validation
    'validation.emailRequired': 'El correo electrónico es requerido',
    'validation.emailInvalid': 'El correo electrónico debe ser válido',
    'validation.passwordRequired': 'La contraseña es requerida',
    'validation.passwordMinLength': 'La contraseña debe tener al menos {min} caracteres',
    'validation.passwordStrong': 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
    'validation.usernameRequired': 'El nombre de usuario es requerido',
    'validation.usernameMinLength': 'El nombre de usuario debe tener al menos 3 caracteres',
    'validation.usernameFormat': 'El nombre de usuario solo puede contener letras, números y guiones bajos',
    'validation.confirmPassword': 'Confirma tu contraseña',
    'validation.passwordsMatch': 'Las contraseñas no coinciden',
    
    // Errors
    'error.loginFailed': 'Error de inicio de sesión. Intenta de nuevo.',
    'error.signupFailed': 'Error al crear la cuenta. Intenta de nuevo.',
  },
  
  en: {
    // Auth Layout
    'auth.title': 'Agent Hub',
    'auth.subtitle': 'Multi-channel chat management platform',
    
    // Login
    'login.title': 'Sign in to your account',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.submit': 'Sign In',
    'login.noAccount': "Don't have an account?",
    'login.createOne': 'Create one',
    
    // Signup
    'signup.title': 'Create your account',
    'signup.subtitle': 'Set up your Agent Hub instance by creating an admin account',
    'signup.username': 'Username',
    'signup.email': 'Email',
    'signup.password': 'Password',
    'signup.confirmPassword': 'Confirm Password',
    'signup.submit': 'Create Account',
    'signup.hasAccount': 'Already have an account?',
    'signup.signIn': 'Sign in',
    
    // Validation
    'validation.emailRequired': 'Email is required',
    'validation.emailInvalid': 'Email must be valid',
    'validation.passwordRequired': 'Password is required',
    'validation.passwordMinLength': 'Password must be at least {min} characters',
    'validation.passwordStrong': 'Password must contain at least one uppercase, one lowercase letter and one number',
    'validation.usernameRequired': 'Username is required',
    'validation.usernameMinLength': 'Username must be at least 3 characters',
    'validation.usernameFormat': 'Username can only contain letters, numbers and underscores',
    'validation.confirmPassword': 'Please confirm your password',
    'validation.passwordsMatch': 'Passwords do not match',
    
    // Errors
    'error.loginFailed': 'Login failed. Please try again.',
    'error.signupFailed': 'Account creation failed. Please try again.',
  }
}

// Determinar idioma actual basado en configuración
const getCurrentLocale = (): Locale => {
  const configLocale = config.locale as string
  
  if (configLocale.startsWith('en')) return 'en-US'
  if (configLocale.startsWith('es')) return 'es-MX'
  
  return 'es-MX' // default
}

const currentLocale = getCurrentLocale()
const currentTranslations = currentLocale === 'en-US' ? translations.en : translations.es

// Función de traducción simple
export const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
  let translation = currentTranslations[key] || key
  
  // Reemplazar parámetros si existen
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      translation = translation.replace(`{${param}}`, String(value))
    })
  }
  
  return translation
}

// Exportar locale actual para uso en componentes
export const locale = currentLocale