<!--
ChatFilters Component

Filtros para la lista de chats:
- Todos los chats
- No leídos
- Archivados  
- Favoritos
- Por tipo (individuales, grupos)
- Contador de chats por filtro

Props:
- activeFilter?: string - Filtro actualmente activo
- counters?: object - Contadores para cada filtro

Emits:
- @filter-change - Cuando cambia el filtro activo
-->

<template>
  <div class="filters-placeholder">
    <div class="filter active">Todos</div>
    <div class="filter">No leídos</div>
    <div class="filter">Archivados</div>
  </div>
</template>

<script setup lang="ts">
// TODO: Implementar filtros con Vuetify v-chip-group
</script>

<style scoped>
.filters-placeholder {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.filter {
  padding: 6px 12px;
  border-radius: 16px;
  background: #f0f0f0;
  cursor: pointer;
  font-size: 14px;
}

.filter.active {
  background: #e91e63;
  color: white;
}
</style>