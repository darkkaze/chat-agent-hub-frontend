<!--
ChatSearch Component

Barra de búsqueda para filtrar chats con:
- Input de texto con icono de búsqueda
- Sugerencias de búsqueda reciente
- Filtrado en tiempo real
- Botón para limpiar búsqueda
- Atajos de teclado (Ctrl+F)

Props:
- placeholder?: string - Texto del placeholder
- debounce?: number - Delay para la búsqueda (default 300ms)

Emits:
- @search - Emite el término de búsqueda
- @clear - Cuando se limpia la búsqueda
-->

<template>
  <div class="search-placeholder">
    <div class="search-input">
      🔍 Buscar chats...
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO: Implementar búsqueda con Vuetify v-text-field
</script>

<style scoped>
.search-placeholder {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.search-input {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 20px;
  color: #666;
}
</style>