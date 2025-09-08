<!--
MessageInput Component

Input para escribir y enviar mensajes con:
- Área de texto auto-expandible
- Botones para adjuntar archivos (imagen, documento, audio)
- Botón de envío
- Indicador de escritura en tiempo real
- Soporte para emojis y menciones
- Preview de archivos adjuntos
- Atajos de teclado (Enter para enviar, Shift+Enter para nueva línea)

Props:
- placeholder?: string
- disabled?: boolean
- maxLength?: number

Emits:
- @send-message - Enviar mensaje de texto
- @send-attachment - Enviar archivo adjunto
- @typing - Cuando el usuario está escribiendo
-->

<template>
  <div class="message-input-placeholder">
    <div class="input-area">
      <div class="attachments-btn">📎</div>
      <div class="text-input">Escribe un mensaje...</div>
      <div class="send-btn">📤</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO: Implementar input de mensaje con Vuetify
</script>

<style scoped>
.message-input-placeholder {
  padding: 12px;
  border-top: 1px solid #e0e0e0;
  background: white;
}

.input-area {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f5f5;
  border-radius: 24px;
  padding: 8px 12px;
}

.attachments-btn,
.send-btn {
  cursor: pointer;
  padding: 4px;
}

.text-input {
  flex: 1;
  color: #666;
}
</style>