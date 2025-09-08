<!--
ChatListItem Component

Elemento individual de la lista de chats que muestra:
- Avatar del contacto/grupo
- Nombre del contacto
- Preview del último mensaje
- Timestamp del último mensaje
- Badge con número de mensajes no leídos
- Indicador de estado de entrega
- Estado online/offline del contacto

Props:
- chat: Chat - Objeto con datos del chat
- isSelected?: boolean - Si está actualmente seleccionado
- showPreview?: boolean - Mostrar preview del mensaje

Emits:
- @click - Cuando se hace click en el chat
- @context-menu - Menu contextual (archivar, silenciar, etc.)
-->

<template>
  <div class="chat-item-placeholder">
    <div class="avatar-space"></div>
    <div class="content-space">
      <div class="name">Contact Name</div>
      <div class="preview">Last message preview...</div>
    </div>
    <div class="meta-space">
      <div class="timestamp">12:34</div>
      <div class="badge">3</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO: Implementar item de chat con Vuetify v-list-item
</script>

<style scoped>
.chat-item-placeholder {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.avatar-space {
  width: 50px;
  height: 50px;
  background: #ddd;
  border-radius: 50%;
  margin-right: 12px;
}

.content-space {
  flex: 1;
}

.name {
  font-weight: 500;
  margin-bottom: 4px;
}

.preview {
  color: #666;
  font-size: 14px;
}

.meta-space {
  text-align: right;
  font-size: 12px;
}

.timestamp {
  color: #666;
  margin-bottom: 4px;
}

.badge {
  background: #e91e63;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  min-width: 20px;
}
</style>