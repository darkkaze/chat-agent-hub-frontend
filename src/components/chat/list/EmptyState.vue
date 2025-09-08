<!--
EmptyState Component

Estado vacío para cuando no hay chats:
- Ilustración o icono
- Mensaje explicativo
- Botón de acción (ej: "Iniciar conversación")
- Diferentes variantes según el contexto

Props:
- variant?: 'no-chats'|'no-results'|'error'
- title?: string - Título personalizado
- message?: string - Mensaje personalizado
- actionText?: string - Texto del botón de acción

Emits:
- @action - Cuando se hace click en el botón de acción
-->

<template>
  <div class="empty-state-placeholder">
    <div class="icon">💬</div>
    <div class="title">No hay conversaciones</div>
    <div class="message">Inicia una nueva conversación para comenzar</div>
  </div>
</template>

<script setup lang="ts">
// TODO: Implementar estado vacío
</script>

<style scoped>
.empty-state-placeholder {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
}

.message {
  font-size: 14px;
}
</style>