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
    debug: true,
    environment: 'local',
    locale: 'es-MX',
  },
  development: {
    apiBaseUrl: 'https://api.dev.agenthub.com',
    debug: true,
    environment: 'development',
    locale: 'es-MX',
  },
  production: {
    apiBaseUrl: 'https://api.agenthub.com',
    debug: false,
    environment: 'production',
    locale: 'es-MX',
  },
}

export const config = configs[MODE as keyof typeof configs] || configs.localhost

// Para secretos desde variables de entorno del sistema
//export const secrets = {
//}
