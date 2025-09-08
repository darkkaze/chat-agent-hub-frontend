<!--
ChannelLayout Component

Layout principal para las pantallas de chat que incluye:
- SidebarNavigation (barra lateral izquierda)
- Área principal dividida en columnas según la ruta:
  - /channel/:id → Solo lista de chats
  - /channel/:id/chat/:id → Lista de chats + conversación
  - /channel/:id/chat/:id/details → Lista + conversación + detalles

Responsivo:
- Desktop: Columnas lado a lado
- Mobile: Pantalla completa con navegación stack

Props: ninguno
Emits: ninguno
-->

<template>
  <v-app>
    <!-- Sidebar Navigation -->
    <SidebarNavigation />

    <!-- Main Content Area -->
    <v-main>
      <v-container fluid class="pa-0 h-100">
        <div class="channel-layout">
          <!-- TODO: Implementar layout de columnas responsive -->
          <div class="placeholder-content">
            <h2>ChannelLayout - Placeholder</h2>
            <p>Aquí irán las columnas de chat</p>
            <router-view />
          </div>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import SidebarNavigation from '@/components/common/SidebarNavigation.vue'
</script>

<style scoped>
.channel-layout {
  height: 100vh;
  display: flex;
}

.placeholder-content {
  flex: 1;
  padding: 20px;
  background: #fafafa;
}
</style>