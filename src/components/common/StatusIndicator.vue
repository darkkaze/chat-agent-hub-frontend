<!--
StatusIndicator Component

Pequeño indicador circular de estado del usuario:
- Verde: online
- Gris: offline  
- Amarillo: away/ausente
- Rojo: do not disturb
- Puede ser absoluto sobre avatar o inline

Props:
- status: 'online'|'offline'|'away'|'dnd'
- size?: 'sm'|'md'|'lg'
- position?: 'absolute'|'inline'

Emits: ninguno
-->

<template>
  <div class="status-placeholder">
    Status
  </div>
</template>

<script setup lang="ts">
// TODO: Implementar indicador de estado
</script>

<style scoped>
.status-placeholder {
  width: 12px;
  height: 12px;
  background: #4caf50;
  border-radius: 50%;
  border: 2px solid white;
}
</style>