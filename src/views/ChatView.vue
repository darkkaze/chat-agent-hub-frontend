<!--
ChatView Component

Vista de conversación individual que muestra:
- Header con info del contacto y botones de acción
- Lista de mensajes con scroll infinito
- Indicador de "escribiendo"
- Input para enviar mensajes con attachments
- Estados de entrega/lectura de mensajes

Ruta: /channel/:channelId/chat/:chatId
Props: channelId y chatId vienen del router
Emits: @message-sent, @details-toggle
-->

<template>
  <div class="chat-view">
    <div class="placeholder-content">
      <h2>ChatView - Conversación</h2>
      <p>Channel ID: {{ $route.params.channelId }}</p>
      <p>Chat ID: {{ $route.params.chatId }}</p>
      <p>Aquí irán los mensajes de la conversación</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

// Guardar el canal visitado cuando se monta el componente
onMounted(() => {
  const channelId = route.params.channelId as string
  if (channelId) {
    authStore.setLastVisitedChannel(channelId)
  }
})
</script>

<style scoped>
.chat-view {
  height: 100%;
  background: white;
  border-left: 1px solid #e0e0e0;
}

.placeholder-content {
  padding: 20px;
}
</style>