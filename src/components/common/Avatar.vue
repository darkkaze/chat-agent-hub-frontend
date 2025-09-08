<!--
Avatar Component

Componente reutilizable para mostrar fotos de perfil con fallbacks:
- Imagen del usuario si está disponible
- Iniciales del nombre como fallback
- Ícono genérico si no hay nombre
- Indicador de estado online/offline opcional
- Diferentes tamaños (xs, sm, md, lg, xl)

Props: 
- src?: string - URL de la imagen
- name?: string - Nombre para generar iniciales
- size?: 'xs'|'sm'|'md'|'lg'|'xl'
- showStatus?: boolean - Mostrar indicador de estado
- status?: 'online'|'offline'|'away'

Emits: @click si es clickeable
-->

<template>
  <div class="avatar-placeholder">
    Avatar Component
  </div>
</template>

<script setup lang="ts">
// TODO: Implementar avatar con Vuetify v-avatar
</script>

<style scoped>
.avatar-placeholder {
  width: 40px;
  height: 40px;
  background: #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
</style>