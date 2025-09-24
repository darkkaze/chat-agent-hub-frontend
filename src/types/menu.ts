/**
 * Menu Types
 *
 * Tipos para el sistema de gestión de menús
 * Basado en la API backend /menu
 */

// Menu item model según backend
export interface MenuItem {
  id: string           // Auto-generado: menu_xxxxxxxxxx
  name: string         // Nombre descriptivo del menú
  icon: string         // Nombre del icono MDI (ej: 'mdi-analytics')
  url: string          // Ruta de navegación
}

// Para creación de menús (sin id)
export interface CreateMenuItemRequest {
  name: string
  icon: string
  url: string
}

// Para actualización de menús
export interface UpdateMenuItemRequest {
  name?: string
  icon?: string
  url?: string
}

// Response types para APIs
export interface MenuApiResponse {
  items: MenuItem[]
}

export interface MenuItemApiResponse {
  item: MenuItem
}

// Lista de iconos comunes para aplicaciones
export const COMMON_APP_ICONS = [
  { value: 'mdi-basket', label: 'Caja', category: 'General' },
] as const

// Utilidades de validación de iconos
export const isValidMdiIcon = (icon: string): boolean => {
  return typeof icon === 'string' && icon.startsWith('mdi-') && icon.length > 4
}

export const getIconLabel = (iconValue: string): string => {
  const icon = COMMON_APP_ICONS.find(i => i.value === iconValue)
  return icon?.label || iconValue.replace('mdi-', '').replace('-', ' ')
}