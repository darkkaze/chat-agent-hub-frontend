/**
 * Menu Store
 *
 * Store para manejo de menús dinámicos del sistema
 * - Lista de menús externos
 * - Caché inteligente con TTL de 24 horas
 * - Invalidación automática tras CRUD
 * - Carga durante login o inicialización
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { menuService } from '@/services/menu/menuService'
import type { MenuItem } from '@/types/menu'

const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 horas en milisegundos

interface MenuCache {
  menus: MenuItem[]
  timestamp: number
  userId: string
}

export const useMenuStore = defineStore('menu', () => {
  // State
  const menus = ref<MenuItem[]>([])
  const isLoading = ref(false)
  const lastFetchTime = ref<number>(0)
  const error = ref('')

  // Getters
  const hasValidCache = computed(() => {
    const now = Date.now()
    return lastFetchTime.value > 0 && (now - lastFetchTime.value) < CACHE_TTL
  })

  const menuCount = computed(() => menus.value.length)

  // Cache utilities
  const getCacheKey = (userId: string) => `menu_cache_${userId}`

  const loadFromCache = (userId: string): boolean => {
    try {
      const cacheKey = getCacheKey(userId)
      const cached = localStorage.getItem(cacheKey)

      if (!cached) return false

      const cacheData: MenuCache = JSON.parse(cached)
      const now = Date.now()

      // Verificar TTL y que sea del mismo usuario
      if (cacheData.userId !== userId || (now - cacheData.timestamp) > CACHE_TTL) {
        localStorage.removeItem(cacheKey)
        return false
      }

      // Cargar desde caché
      menus.value = cacheData.menus
      lastFetchTime.value = cacheData.timestamp

      console.log(`Menús cargados desde caché: ${cacheData.menus.length} items`)
      return true
    } catch (err) {
      console.error('Error loading menu cache:', err)
      return false
    }
  }

  const saveToCache = (userId: string) => {
    try {
      const cacheKey = getCacheKey(userId)
      const now = Date.now()

      const cacheData: MenuCache = {
        menus: menus.value,
        timestamp: now,
        userId
      }

      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
      lastFetchTime.value = now

      console.log(`Menús guardados en caché: ${menus.value.length} items`)
    } catch (err) {
      console.error('Error saving menu cache:', err)
    }
  }

  const clearCache = (userId?: string) => {
    if (userId) {
      const cacheKey = getCacheKey(userId)
      localStorage.removeItem(cacheKey)
    } else {
      // Limpiar todos los caches de menús
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('menu_cache_')) {
          localStorage.removeItem(key)
        }
      })
    }

    lastFetchTime.value = 0
    console.log('Caché de menús limpiado')
  }

  // Actions
  const loadMenus = async (userId: string, forceRefresh = false): Promise<void> => {
    // Si hay caché válido y no es refresh forzado, usar caché
    if (!forceRefresh && loadFromCache(userId)) {
      return
    }

    isLoading.value = true
    error.value = ''

    try {
      console.log('Cargando menús desde API...')
      const response = await menuService.getMenuItems()

      // El backend puede devolver array directamente o un objeto con wrapper
      const menuItems = Array.isArray(response) ? response : (response as any).menus || []

      menus.value = menuItems
      saveToCache(userId)

      console.log(`Menús cargados desde API: ${menuItems.length} items`)
    } catch (err: any) {
      error.value = err.detail || 'Error al cargar menús'
      console.error('Error loading menus:', err)

      // Si falla la API, intentar usar caché aunque esté expirado
      if (!forceRefresh) {
        loadFromCache(userId)
      }
    } finally {
      isLoading.value = false
    }
  }

  const refreshMenus = async (userId: string): Promise<void> => {
    console.log('Invalidando caché y recargando menús...')
    clearCache(userId)
    await loadMenus(userId, true)
  }

  const initializeMenus = async (userId: string): Promise<void> => {
    // Cargar menús solo si no hay caché válido
    if (!hasValidCache.value) {
      await loadMenus(userId)
    }
  }

  const clearUserData = (userId?: string) => {
    menus.value = []
    error.value = ''
    clearCache(userId)
  }

  return {
    // State
    menus,
    isLoading,
    error,

    // Getters
    hasValidCache,
    menuCount,

    // Actions
    loadMenus,
    refreshMenus,
    initializeMenus,
    clearUserData
  }
})