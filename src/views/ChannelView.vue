<!--
ChannelView Component

Vista principal que muestra la lista de chats de un canal específico.
Incluye:
- Header del canal con título y acciones
- Buscador de chats
- Filtros (todos, no leídos, archivados)
- Lista de chats con preview del último mensaje
- Estado vacío cuando no hay chats

Ruta: /channel/:channelId
Props: channelId viene del router
Emits: @chat-selected cuando se selecciona un chat
-->

<template>
  <div class="channel-view">
    <div class="placeholder-content">
      <h2>ChannelView - Lista de Chats</h2>
      <p>Channel ID: {{ $route.params.channelId }}</p>
      <p>Aquí irá la lista de conversaciones del canal</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO: Implementar lógica de lista de chats
</script>

<style scoped>
.channel-view {
  height: 100%;
  background: white;
}

.placeholder-content {
  padding: 20px;
}
</style>