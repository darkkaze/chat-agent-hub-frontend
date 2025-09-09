/**
 * Auth Store
 * 
 * Store para manejo del estado de autenticación
 * - Estado del usuario logueado
 * - Datos del usuario (nombre, rol, etc.)
 * - Canal visitado recientemente
 * - Loading states para auth
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import type { UserResponse } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<UserResponse | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const lastVisitedChannel = ref<string>('')

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!apiService.getToken())
  const userName = computed(() => user.value?.username || '')
  const userRole = computed(() => user.value?.role || '')

  // Actions
  const setUser = (userData: UserResponse) => {
    user.value = userData
    // Guardar algunos datos básicos en localStorage
    localStorage.setItem('user_data', JSON.stringify({
      id: userData.id,
      username: userData.username,
      role: userData.role
    }))
  }

  const clearUser = () => {
    user.value = null
    localStorage.removeItem('user_data')
    localStorage.removeItem('last_visited_channel')
    apiService.clearToken()
  }

  const setLastVisitedChannel = (channelId: string) => {
    lastVisitedChannel.value = channelId
    localStorage.setItem('last_visited_channel', channelId)
  }

  const getLastVisitedChannel = (): string => {
    if (!lastVisitedChannel.value) {
      lastVisitedChannel.value = localStorage.getItem('last_visited_channel') || 'whatsapp'
    }
    return lastVisitedChannel.value
  }

  const initializeAuth = async () => {
    if (isInitialized.value) return
    
    isLoading.value = true
    
    try {
      // Verificar si hay token en localStorage
      const token = apiService.getToken()
      if (!token) {
        isInitialized.value = true
        isLoading.value = false
        return false
      }

      // Intentar restaurar datos básicos del usuario desde localStorage
      const storedUserData = localStorage.getItem('user_data')
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData)
          user.value = userData
        } catch {
          // Si falla el parse, limpiar storage corrupto
          localStorage.removeItem('user_data')
        }
      }

      // TODO: Aquí podrías validar el token con el backend si es necesario
      // Por ahora, si hay token y datos, asumimos que es válido
      isInitialized.value = true
      isLoading.value = false
      return !!token && !!user.value
      
    } catch (error) {
      console.error('Error initializing auth:', error)
      clearUser()
      isInitialized.value = true
      isLoading.value = false
      return false
    }
  }

  const login = async (userData: UserResponse, token: string) => {
    apiService.setToken(token)
    setUser(userData)
  }

  const logout = () => {
    clearUser()
  }

  return {
    // State
    user: computed(() => user.value),
    isLoading: computed(() => isLoading.value),
    isInitialized: computed(() => isInitialized.value),
    lastVisitedChannel: computed(() => lastVisitedChannel.value),
    
    // Getters
    isAuthenticated,
    userName,
    userRole,
    
    // Actions
    setUser,
    clearUser,
    setLastVisitedChannel,
    getLastVisitedChannel,
    initializeAuth,
    login,
    logout
  }
})