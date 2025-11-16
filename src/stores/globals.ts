/**
 * Globals Store
 *
 * Store for global application configuration loaded from backend.
 * Loads configuration from /api/globals endpoint very early in app lifecycle.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'

interface GlobalsConfig {
  frontend_project_name: string
}

export const useGlobalsStore = defineStore('globals', () => {
  // State
  const projectName = ref<string>('Agent Hub')
  const isLoaded = ref(false)

  // Getters
  const browserTitle = computed(() => `${projectName.value} | Agent Hub`)
  const sidebarTitle = computed(() => projectName.value)

  // Actions
  const loadGlobals = async () => {
    if (isLoaded.value) return

    try {
      // Note: apiService.baseURL already includes '/api', so use '/globals' directly
      const response = await apiService.get<GlobalsConfig>('/globals')
      projectName.value = response.frontend_project_name || 'Agent Hub'
      isLoaded.value = true

      // Update document title immediately
      document.title = browserTitle.value

      console.log('Globals loaded:', { projectName: projectName.value })
    } catch (error) {
      console.error('Failed to load globals:', error)
      // Use default value and mark as loaded to not block the app
      projectName.value = 'Agent Hub'
      isLoaded.value = true
    }
  }

  return {
    // State
    projectName: computed(() => projectName.value),
    isLoaded: computed(() => isLoaded.value),

    // Getters
    browserTitle,
    sidebarTitle,

    // Actions
    loadGlobals
  }
})
