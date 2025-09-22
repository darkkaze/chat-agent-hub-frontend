<!--
Users Admin View

Vista placeholder para administración de usuarios

Ruta: /admin/users
-->

<template>
  <div class="admin-view">
    <div class="admin-header pa-6 border-b">
      <h1 class="text-h4 font-weight-bold mb-2">
        Gestión de Usuarios
      </h1>
      <p class="text-body-1 text-on-surface-variant">
        Administra los usuarios del sistema
      </p>
    </div>

    <div class="admin-content pa-6">
      <v-card variant="outlined" class="pa-8 text-center">
        <v-icon size="64" color="primary" class="mb-4">
          mdi-account-group
        </v-icon>
        <h2 class="text-h5 mb-3">
          Próximamente
        </h2>
        <p class="text-body-1 text-on-surface-variant">
          La gestión de usuarios estará disponible en una próxima actualización.
        </p>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
// Placeholder component for users administration
</script>

<style scoped>
.admin-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-header {
  flex-shrink: 0;
  background: rgb(var(--v-theme-surface));
}

.admin-content {
  flex: 1;
  overflow-y: auto;
  background: rgb(var(--v-theme-background));
}
</style>