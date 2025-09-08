/**
 * Channels Store
 * 
 * Maneja el estado de los canales de comunicación
 * - Lista de canales disponibles
 * - Canal actualmente seleccionado
 * - Estado de conexión de canales
 * - Configuraciones de canal
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Channel } from '@/types/channel'

export const useChannelsStore = defineStore('channels', () => {
  // State
  const channels = ref<Channel[]>([])
  const activeChannelId = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeChannel = computed(() => 
    channels.value.find(ch => ch.id === activeChannelId.value)
  )

  const connectedChannels = computed(() =>
    channels.value.filter(ch => ch.isConnected)
  )

  const channelNotifications = computed(() =>
    channels.value.reduce((total, ch) => total + ch.notifications, 0)
  )

  // Actions
  function setActiveChannel(channelId: string) {
    activeChannelId.value = channelId
  }

  async function fetchChannels() {
    // TODO: Implementar fetch de canales
    isLoading.value = true
    try {
      // Mock data por ahora
      channels.value = []
    } catch (err) {
      error.value = 'Error fetching channels'
    } finally {
      isLoading.value = false
    }
  }

  async function updateChannel(channelId: string, updates: Partial<Channel>) {
    // TODO: Implementar actualización de canal
  }

  return {
    // State
    channels,
    activeChannelId,
    isLoading,
    error,
    // Getters
    activeChannel,
    connectedChannels,
    channelNotifications,
    // Actions
    setActiveChannel,
    fetchChannels,
    updateChannel
  }
})