<!--
MessageBubble Component

Burbuja individual de mensaje que soporta:
- Mensajes de texto con formato (bold, italic, links)
- Mensajes multimedia (imagen, video, audio, documento)
- Mensajes del sistema (usuario se unió, cambió nombre, etc.)
- Estados de entrega (enviado, entregado, leído)
- Timestamp y autor
- Reacciones y replies
- Menu contextual (copiar, responder, reenviar, eliminar)

Props:
- message: Message - Objeto con datos del mensaje
- isOwn?: boolean - Si es mensaje propio
- showAvatar?: boolean - Mostrar avatar (útil en grupos)
- showTimestamp?: boolean - Mostrar timestamp

Emits:
- @reply - Responder al mensaje
- @react - Reaccionar al mensaje
- @context-menu - Abrir menu contextual
-->

<template>
  <div class="message-bubble-placeholder">
    <div class="bubble own">
      <div class="text">Este es un mensaje de prueba</div>
      <div class="meta">
        <span class="time">12:34</span>
        <span class="status">✓✓</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO: Implementar burbuja de mensaje
</script>

<style scoped>
.message-bubble-placeholder {
  display: flex;
  margin: 8px 12px;
}

.bubble {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 18px;
  background: #f0f0f0;
}

.bubble.own {
  background: #e91e63;
  color: white;
  margin-left: auto;
}

.text {
  margin-bottom: 4px;
}

.meta {
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.7;
}
</style>