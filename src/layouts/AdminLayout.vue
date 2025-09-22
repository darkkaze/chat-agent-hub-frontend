<!--
AdminLayout Component

Layout para las pantallas de administración que incluye:
- SidebarNavigation (barra lateral izquierda)
- Área principal de una sola columna para vistas admin
- Diseño optimizado para interfaces de administración

Usado para rutas:
- /admin/channels
- /admin/users
- /admin/agents

Props: ninguno
Emits: ninguno
-->

<template>
  <v-app>
    <!-- Sidebar Navigation -->
    <SidebarNavigation />

    <!-- Main Content Area -->
    <v-main class="main-content">
      <div class="admin-layout">
        <!-- Single Column for Admin Content -->
        <div class="admin-content-column">
          <router-view />
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import SidebarNavigation from '@/components/common/SidebarNavigation.vue'
</script>

<style scoped>
/* Main content container - fill viewport height */
.main-content {
  height: 100vh;
  overflow: hidden;
}

/* Admin layout container */
.admin-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgb(var(--v-theme-background));
}

/* Single column for admin content */
.admin-content-column {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Ensure admin views take full height */
.admin-content-column :deep(.admin-view) {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Responsive adjustments */
@media (max-width: 959px) {
  .admin-layout {
    padding: 0;
  }
}

@media (min-width: 960px) {
  .admin-layout {
    padding: 0;
  }
}
</style>