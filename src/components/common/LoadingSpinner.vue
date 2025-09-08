<!--
LoadingSpinner Component

Componente de loading reutilizable con diferentes variantes:
- Spinner circular para operaciones generales
- Dots animados para cargas de mensajes
- Skeleton loader para contenido estructurado
- Diferentes tamaños y colores

Props:
- variant?: 'spinner'|'dots'|'skeleton'
- size?: 'xs'|'sm'|'md'|'lg'
- color?: string
- text?: string - Texto opcional debajo del spinner

Emits: ninguno
-->

<template>
  <div class="loading-placeholder">
    Loading...
  </div>
</template>

<script setup lang="ts">
// TODO: Implementar loading con Vuetify v-progress-circular
</script>

<style scoped>
.loading-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #666;
}
</style>