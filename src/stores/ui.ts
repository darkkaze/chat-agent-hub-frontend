/**
 * UI Store
 * 
 * Maneja el estado de la interfaz de usuario
 * - Estados de modales y dialogs
 * - Configuración de layout (sidebar, panels)
 * - Preferencias de usuario
 * - Estados de carga globales
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // State
  const sidebarOpen = ref(true)
  const sidebarCompact = ref(true)
  const mobileSidebarOpen = ref(false)
  const detailsPanelOpen = ref(false)
  const currentModal = ref<string | null>(null)
  const theme = ref<'light' | 'dark'>('light')
  
  // Responsive breakpoints
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isDesktop = ref(true)

  // Loading states
  const globalLoading = ref(false)
  const loadingStates = ref<Map<string, boolean>>(new Map())

  // Getters
  const sidebarWidth = computed(() => {
    if (isMobile.value) return mobileSidebarOpen.value ? 280 : 0
    return sidebarCompact.value ? 64 : 200
  })

  const contentColumns = computed(() => {
    if (isMobile.value) return 1
    let columns = 1 // always chat list
    if (detailsPanelOpen.value) columns += 2 // chat + details
    else columns += 1 // just chat
    return columns
  })

  const isLoading = (key: string) => computed(() => 
    loadingStates.value.get(key) || false
  )

  // Actions
  function toggleSidebar() {
    if (isMobile.value) {
      mobileSidebarOpen.value = !mobileSidebarOpen.value
    } else {
      sidebarOpen.value = !sidebarOpen.value
    }
  }

  function toggleSidebarCompact() {
    if (!isMobile.value) {
      sidebarCompact.value = !sidebarCompact.value
    }
  }

  function toggleDetailsPanel() {
    detailsPanelOpen.value = !detailsPanelOpen.value
  }

  function openModal(modalName: string) {
    currentModal.value = modalName
  }

  function closeModal() {
    currentModal.value = null
  }

  function setLoading(key: string, loading: boolean) {
    if (loading) {
      loadingStates.value.set(key, true)
    } else {
      loadingStates.value.delete(key)
    }
  }

  function setBreakpoint(breakpoint: { mobile: boolean; tablet: boolean; desktop: boolean }) {
    isMobile.value = breakpoint.mobile
    isTablet.value = breakpoint.tablet
    isDesktop.value = breakpoint.desktop
  }

  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
  }

  return {
    // State
    sidebarOpen,
    sidebarCompact,
    mobileSidebarOpen,
    detailsPanelOpen,
    currentModal,
    theme,
    isMobile,
    isTablet,
    isDesktop,
    globalLoading,
    // Getters
    sidebarWidth,
    contentColumns,
    isLoading,
    // Actions
    toggleSidebar,
    toggleSidebarCompact,
    toggleDetailsPanel,
    openModal,
    closeModal,
    setLoading,
    setBreakpoint,
    setTheme
  }
})