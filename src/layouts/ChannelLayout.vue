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
    <v-main class="main-content">
      <div class="channel-layout">
        <!-- Chat List Column -->
        <div class="chat-list-column">
          <ChannelView :key="route.params.channelId as string" />
        </div>

        <!-- Chat Content Column -->
        <div class="chat-content-column">
          <div v-if="!route.params.chatId" class="empty-chat-area">
            <div class="d-flex flex-column align-center justify-center h-100 pa-8">
              <v-icon size="120" color="on-surface-variant" class="mb-6">
                mdi-chat-outline
              </v-icon>
              <h2 class="text-h5 text-on-surface-variant text-center mb-4">
                ¡Bienvenido a {{ globalsStore.sidebarTitle }}!
              </h2>
              <p class="text-body-1 text-on-surface-variant text-center mb-6" style="max-width: 400px;">
                Selecciona una conversación de la lista para comenzar a chatear con tus clientes,
                o espera a que lleguen nuevos mensajes.
              </p>
              <v-btn
                color="primary"
                variant="tonal"
                prepend-icon="mdi-refresh"
                @click="refreshChats"
              >
                Actualizar conversaciones
              </v-btn>
            </div>
          </div>
          <router-view v-else />
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useGlobalsStore } from '@/stores/globals'
import SidebarNavigation from '@/components/common/SidebarNavigation.vue'
import ChannelView from '@/views/ChannelView.vue'

const route = useRoute()
const router = useRouter()
const globalsStore = useGlobalsStore()


const refreshChats = () => {
  // Reload the current route to refresh chat list
  router.go(0)
}
</script>

<style scoped>
/* Main content container - fill viewport height */
.main-content {
  height: 100vh;
  overflow: hidden;
}

/* Channel layout - fixed grid system */
.channel-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  height: 100vh;
  overflow: hidden;
}

/* All chats layout uses same 2-column layout as channel layout */

/* Chat list column - independent overflow */
.chat-list-column {
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Chat content column - independent overflow */
.chat-content-column {
  background: rgb(var(--v-theme-background));
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Empty chat area */
.empty-chat-area {
  height: 100%;
  background: rgb(var(--v-theme-background));
  background-image:
    radial-gradient(circle at 20px 20px, rgba(var(--v-theme-on-surface), 0.05) 1px, transparent 1px),
    radial-gradient(circle at 60px 60px, rgba(var(--v-theme-on-surface), 0.05) 1px, transparent 1px);
  background-size: 80px 80px;
  background-position: 0 0, 40px 40px;
}

/* Mobile responsiveness */
@media (max-width: 959px) {
  .channel-layout {
    grid-template-columns: 1fr;
    height: calc(100vh - 64px);
  }

  .chat-content-column {
    display: none;
  }
}

/* Show chat content when chat is selected on mobile */
@media (max-width: 959px) {
  .channel-layout.has-selected-chat {
    grid-template-columns: 1fr;
  }

  .channel-layout.has-selected-chat .chat-list-column {
    display: none;
  }

  .channel-layout.has-selected-chat .chat-content-column {
    display: flex;
  }
}

/* Tablet size adjustments */
@media (min-width: 960px) and (max-width: 1264px) {
  .channel-layout {
    grid-template-columns: 350px 1fr;
  }
}

/* Large screen adjustments */
@media (min-width: 1920px) {
  .channel-layout {
    grid-template-columns: 450px 1fr;
  }
}
</style>