/**
 * Application Configuration
 *
 * Configuración por ambiente sin archivos .env
 * Los comandos npm mapean a diferentes modos de Vite
 */

const MODE = import.meta.env.MODE || 'localhost'

const configs = {
  localhost: {
    apiBaseUrl: 'http://localhost:8000',
    websocketUrl: 'ws://localhost:8000/ws',
    debug: true,
    environment: 'local',
    locale: 'es-MX',
    timezone: 'America/Mexico_City', // GMT-6
  },
  development: {
    apiBaseUrl: 'https://api.dev.agenthub.com',
    websocketUrl: 'wss://api.dev.agenthub.com/ws',
    debug: true,
    environment: 'development',
    locale: 'es-MX',
    timezone: 'America/Mexico_City', // GMT-6
  },
  production: {
    apiBaseUrl: 'https://api.agenthub.com',
    websocketUrl: 'wss://api.agenthub.com/ws',
    debug: false,
    environment: 'production',
    locale: 'es-MX',
    timezone: 'America/Mexico_City', // GMT-6
  },
}

export const config = configs[MODE as keyof typeof configs] || configs.localhost

/**
 * Convierte un timestamp UTC a la timezone configurada
 */
export const toLocalTimezone = (utcTimestamp: string): Date => {
  // Crear fecha desde UTC (JavaScript ya parsea el ISO string correctamente)
  const utcDate = new Date(utcTimestamp)
  
  // JavaScript automáticamente convierte a la timezone local del usuario
  // Si queremos forzar una timezone específica, necesitamos usar Intl.DateTimeFormat
  return utcDate
}

/**
 * Formatea una fecha para mostrar en la timezone configurada
 */
export const formatDateWithTimezone = (utcTimestamp: string, options?: Intl.DateTimeFormatOptions): string => {
  // Agregar 'Z' al final si no tiene timezone indicator para forzar UTC
  const normalizedTimestamp = utcTimestamp.endsWith('Z') ? utcTimestamp : `${utcTimestamp}Z`
  const date = new Date(normalizedTimestamp)
  
  return date.toLocaleString(config.locale, {
    timeZone: config.timezone,
    ...options
  })
}

/**
 * Obtiene la diferencia en milisegundos entre un timestamp UTC y ahora, 
 * considerando la timezone configurada
 */
export const getTimeDifferenceMs = (utcTimestamp: string): number => {
  // Agregar 'Z' al final si no tiene timezone indicator para forzar UTC
  const normalizedTimestamp = utcTimestamp.endsWith('Z') ? utcTimestamp : `${utcTimestamp}Z`
  const messageDate = new Date(normalizedTimestamp)
  const now = new Date()
  
  // Calcular la diferencia considerando que ambas fechas están en la misma timezone
  return now.getTime() - messageDate.getTime()
}

// Para secretos desde variables de entorno del sistema
//export const secrets = {
//}
