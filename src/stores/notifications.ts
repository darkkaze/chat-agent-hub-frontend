/**
 * Notifications Store
 *
 * Maneja el estado de las notificaciones de audio y su configuración
 * - Estado de permisos de audio
 * - Configuración de usuario para sonidos
 * - Integración con el servicio de audio
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  notificationService,
  AudioPermissionStatus,
  type NotificationAudioConfig
} from '@/services/audio/notificationService'
import { visibilityService, type VisibilityState } from '@/services/browser/visibilityService'

export const useNotificationsStore = defineStore('notifications', () => {
  // State
  const permissionStatus = ref<AudioPermissionStatus>(AudioPermissionStatus.UNKNOWN)
  const audioConfig = ref<NotificationAudioConfig>(notificationService.getConfig())
  const isInitialized = ref(false)
  const isPageVisible = ref<boolean>(visibilityService.getIsVisible())
  const visibilityState = ref<VisibilityState>(visibilityService.getVisibilityState())

  // Getters
  const isAudioEnabled = computed(() => audioConfig.value.enabled)
  const hasAudioPermission = computed(() => permissionStatus.value === AudioPermissionStatus.GRANTED)
  const isPermissionDenied = computed(() => permissionStatus.value === AudioPermissionStatus.DENIED)
  const needsUserInteraction = computed(() =>
    permissionStatus.value === AudioPermissionStatus.PROMPT ||
    permissionStatus.value === AudioPermissionStatus.DENIED
  )
  const canPlayNotifications = computed(() =>
    isAudioEnabled.value && hasAudioPermission.value && notificationService.isReady()
  )
  const shouldShowVisualNotifications = computed(() => !isPageVisible.value)
  const isPageHidden = computed(() => !isPageVisible.value)

  // Actions
  async function initialize() {
    if (isInitialized.value) return

    try {
      // Get current permission status
      permissionStatus.value = await notificationService.requestAudioPermission()

      // Update config from service
      audioConfig.value = notificationService.getConfig()

      // Initialize visibility tracking
      initializeVisibilityTracking()

      isInitialized.value = true

      console.log('Notifications store initialized with permission:', permissionStatus.value)
    } catch (error) {
      console.error('Error initializing notifications store:', error)
    }
  }

  async function requestPermissions(): Promise<boolean> {
    try {
      permissionStatus.value = await notificationService.requestAudioPermission()
      return hasAudioPermission.value
    } catch (error) {
      console.error('Error requesting audio permissions:', error)
      return false
    }
  }

  async function enableAudioWithUserInteraction(): Promise<boolean> {
    try {
      const success = await notificationService.playWithUserInteraction()
      if (success) {
        permissionStatus.value = AudioPermissionStatus.GRANTED
        audioConfig.value = notificationService.getConfig()
      }
      return success
    } catch (error) {
      console.error('Error enabling audio with user interaction:', error)
      return false
    }
  }

  async function playNotificationSound(): Promise<boolean> {
    if (!canPlayNotifications.value) {
      console.warn('Cannot play notification: audio not enabled or permission not granted')
      return false
    }

    try {
      const success = await notificationService.playNotification()

      // Update permission status in case it changed
      permissionStatus.value = notificationService.getPermissionStatus()

      return success
    } catch (error) {
      console.error('Error playing notification sound:', error)
      return false
    }
  }

  function setAudioEnabled(enabled: boolean): void {
    notificationService.setEnabled(enabled)
    audioConfig.value = notificationService.getConfig()
  }

  function setVolume(volume: number): void {
    notificationService.setVolume(volume)
    audioConfig.value = notificationService.getConfig()
  }

  function updateConfig(): void {
    audioConfig.value = notificationService.getConfig()
    permissionStatus.value = notificationService.getPermissionStatus()
  }

  // Initialize visibility tracking
  function initializeVisibilityTracking(): void {
    // Update initial state
    isPageVisible.value = visibilityService.getIsVisible()
    visibilityState.value = visibilityService.getVisibilityState()

    // Listen for visibility changes
    visibilityService.addVisibilityChangeListener(handleVisibilityChange)

    console.log('Visibility tracking initialized')
  }

  // Handle visibility change events
  function handleVisibilityChange(visible: boolean, state: VisibilityState): void {
    isPageVisible.value = visible
    visibilityState.value = state

    console.log(`Page visibility changed: ${visible ? 'visible' : 'hidden'} (${state})`)
  }

  // Get current visibility info
  function getVisibilityInfo() {
    return {
      isVisible: isPageVisible.value,
      state: visibilityState.value,
      isHidden: !isPageVisible.value,
      shouldShowVisualNotifications: shouldShowVisualNotifications.value
    }
  }

  // Cleanup when store is destroyed
  function destroy(): void {
    visibilityService.removeVisibilityChangeListener(handleVisibilityChange)
    notificationService.destroy()
    isInitialized.value = false
  }

  return {
    // State
    permissionStatus: computed(() => permissionStatus.value),
    audioConfig: computed(() => audioConfig.value),
    isInitialized: computed(() => isInitialized.value),
    isPageVisible: computed(() => isPageVisible.value),
    visibilityState: computed(() => visibilityState.value),

    // Getters
    isAudioEnabled,
    hasAudioPermission,
    isPermissionDenied,
    needsUserInteraction,
    canPlayNotifications,
    shouldShowVisualNotifications,
    isPageHidden,

    // Actions
    initialize,
    requestPermissions,
    enableAudioWithUserInteraction,
    playNotificationSound,
    setAudioEnabled,
    setVolume,
    updateConfig,
    getVisibilityInfo,
    destroy
  }
})