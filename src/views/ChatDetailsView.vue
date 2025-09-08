<!--
ChatDetailsView Component

Panel lateral derecho con detalles del chat:
- Información del contacto/grupo
- Media compartida (fotos, videos, documentos)
- Configuraciones del chat
- Opciones de bloqueo/silencio
- Historial de acciones

Ruta: /channel/:channelId/chat/:chatId/details
Props: channelId y chatId vienen del router
Emits: @close-details
-->

<template>
  <div class="chat-details-view">
    <div class="placeholder-content">
      <h2>ChatDetailsView - Detalles</h2>
      <p>Channel ID: {{ $route.params.channelId }}</p>
      <p>Chat ID: {{ $route.params.chatId }}</p>
      <p>Aquí irán los detalles del chat</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO: Implementar lógica de detalles
</script>

<style scoped>
.chat-details-view {
  height: 100%;
  background: #f9f9f9;
  border-left: 1px solid #e0e0e0;
  min-width: 300px;
}

.placeholder-content {
  padding: 20px;
}
</style>