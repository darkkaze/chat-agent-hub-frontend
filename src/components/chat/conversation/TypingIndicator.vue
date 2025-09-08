<!--
TypingIndicator Component

Indicador animado que muestra cuando alguien está escribiendo:
- Puntos animados
- Texto "está escribiendo..."
- Avatar del usuario que escribe (en grupos)
- Auto-hide después de timeout

Props:
- users: string[] - Usuarios que están escribiendo
- showAvatar?: boolean - Mostrar avatar en grupos

Emits: ninguno
-->

<template>
  <div class="typing-placeholder">
    <div class="avatar-space"></div>
    <div class="dots">
      <span>●</span>
      <span>●</span>
      <span>●</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO: Implementar indicador de escritura
</script>

<style scoped>
.typing-placeholder {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  opacity: 0.7;
}

.avatar-space {
  width: 24px;
  height: 24px;
  background: #ddd;
  border-radius: 50%;
}

.dots span {
  animation: typing 1.4s infinite;
  color: #666;
  margin-right: 2px;
}

.dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% { opacity: 0.3; }
  30% { opacity: 1; }
}
</style>