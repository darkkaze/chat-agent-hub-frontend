<!--
ChatDetailsPanel Component

Panel lateral para mostrar detalles del chat con tabs:
- Tab 1: Información del chat (ChatInfoTab)
- Tab 2: Agentes del chat (ChatAgentsTab)

Props: chat, visible, channelId, chatId
Emits: @close, @update:visible
Responsive: Panel lateral en desktop, drawer en mobile
-->

<template>
  <!-- Desktop Panel -->
  <div
    v-if="!isMobile"
    :class="panelClasses"
    class="chat-details-panel"
  >
    <div class="panel-content d-flex flex-column h-100">
      <!-- Header -->
      <div class="panel-header px-4 py-3 border-b d-flex align-center justify-space-between">
        <h3 class="text-h6 font-weight-medium">Detalles del Chat</h3>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="closePanel"
        />
      </div>

      <!-- Tabs -->
      <div class="tabs-container flex-1-1 d-flex flex-column">
        <v-tabs
          v-model="selectedTab"
          color="primary"
          density="compact"
          class="border-b"
        >
          <v-tab value="info">
            <v-icon class="mr-2">mdi-information-outline</v-icon>
            Información
          </v-tab>
          <v-tab value="agents">
            <v-icon class="mr-2">mdi-robot-outline</v-icon>
            Agentes
          </v-tab>
        </v-tabs>

        <!-- Tab Content -->
        <div class="tab-content flex-1-1 overflow-hidden">
          <v-tabs-window v-model="selectedTab" class="h-100">
            <v-tabs-window-item value="info" class="h-100">
              <ChatInfoTab
                v-if="chat"
                :chat="chat"
                @assign-user="handleAssignUser"
                @mark-read="handleMarkRead"
              />
            </v-tabs-window-item>

            <v-tabs-window-item value="agents" class="h-100">
              <ChatAgentsTab
                v-if="channelId && chatId"
                :channel-id="channelId"
                :chat-id="chatId"
                @agent-updated="handleAgentUpdated"
              />
            </v-tabs-window-item>
          </v-tabs-window>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile Drawer -->
  <v-navigation-drawer
    v-else
    v-model="drawerVisible"
    location="right"
    temporary
    width="100%"
    class="chat-details-drawer"
  >
    <!-- Mobile Header -->
    <div class="drawer-header px-4 py-3 border-b d-flex align-center justify-space-between">
      <h3 class="text-h6 font-weight-medium">Detalles del Chat</h3>
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        @click="closePanel"
      />
    </div>

    <!-- Mobile Tabs -->
    <div class="mobile-tabs-container d-flex flex-column h-100">
      <v-tabs
        v-model="selectedTab"
        color="primary"
        density="compact"
        class="border-b"
      >
        <v-tab value="info">
          <v-icon class="mr-2">mdi-information-outline</v-icon>
          Información
        </v-tab>
        <v-tab value="agents">
          <v-icon class="mr-2">mdi-robot-outline</v-icon>
          Agentes
        </v-tab>
      </v-tabs>

      <!-- Mobile Tab Content -->
      <div class="mobile-tab-content flex-1-1 overflow-hidden">
        <v-tabs-window v-model="selectedTab" class="h-100">
          <v-tabs-window-item value="info" class="h-100">
            <ChatInfoTab
              v-if="chat"
              :chat="chat"
              @assign-user="handleAssignUser"
              @mark-read="handleMarkRead"
            />
          </v-tabs-window-item>

          <v-tabs-window-item value="agents" class="h-100">
            <ChatAgentsTab
              v-if="channelId && chatId"
              :channel-id="channelId"
              :chat-id="chatId"
              @agent-updated="handleAgentUpdated"
            />
          </v-tabs-window-item>
        </v-tabs-window>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
import ChatInfoTab from './tabs/ChatInfoTab.vue'
import ChatAgentsTab from './tabs/ChatAgentsTab.vue'
import type { ChatResponse } from '@/types/channels'

interface Props {
  chat: ChatResponse | null
  visible: boolean
  channelId: string
  chatId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'update:visible': [value: boolean]
  'assign-user': []
  'mark-read': []
  'agent-updated': [agentId: string, active: boolean]
}>()

// Vuetify composables
const { mobile } = useDisplay()

// Reactive state
const selectedTab = ref('info')
const drawerVisible = ref(false)

// Computed
const isMobile = computed(() => mobile.value)

const panelClasses = computed(() => {
  return {
    'panel-visible': props.visible,
    'panel-hidden': !props.visible
  }
})

// Methods
const closePanel = () => {
  emit('close')
  emit('update:visible', false)
}

const handleAssignUser = () => {
  emit('assign-user')
}

const handleMarkRead = () => {
  emit('mark-read')
}

const handleAgentUpdated = (agentId: string, active: boolean) => {
  emit('agent-updated', agentId, active)
}

// Watchers
watch(
  () => props.visible,
  (newVisible) => {
    if (isMobile.value) {
      drawerVisible.value = newVisible
    }

    // Reset to first tab when opening
    if (newVisible) {
      selectedTab.value = 'info'
    }
  },
  { immediate: true }
)

watch(
  () => drawerVisible.value,
  (newValue) => {
    if (isMobile.value && !newValue) {
      closePanel()
    }
  }
)

// Handle escape key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.visible) {
    closePanel()
  }
}

// Add/remove escape listener
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      document.addEventListener('keydown', handleKeydown)
    } else {
      document.removeEventListener('keydown', handleKeydown)
    }
  }
)
</script>

<style scoped>
/* Desktop Panel Styles */
.chat-details-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 350px;
  height: 100vh;
  background: rgb(var(--v-theme-surface));
  border-left: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  z-index: 1000;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(100%);
}

.chat-details-panel.panel-visible {
  transform: translateX(0);
}

.chat-details-panel.panel-hidden {
  transform: translateX(100%);
}

.panel-content {
  height: 100%;
  background: rgb(var(--v-theme-surface));
}

.panel-header {
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  flex-shrink: 0;
}

.tabs-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tab-content {
  flex: 1;
  overflow: hidden;
  background: rgb(var(--v-theme-background));
}

.border-b {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

/* Mobile Drawer Styles */
.chat-details-drawer {
  z-index: 2000;
}

.drawer-header {
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  flex-shrink: 0;
}

.mobile-tabs-container {
  height: 100%;
  background: rgb(var(--v-theme-surface));
}

.mobile-tab-content {
  background: rgb(var(--v-theme-background));
  overflow: hidden;
}

/* Responsive adjustments */
@media (max-width: 959px) {
  .chat-details-panel {
    display: none;
  }
}

@media (min-width: 960px) {
  .chat-details-drawer {
    display: none;
  }
}

/* Tab window styling */
:deep(.v-tabs-window-item) {
  height: 100%;
}

:deep(.v-tabs-window) {
  height: 100%;
}

/* Scrollbar styling for webkit browsers */
:deep(.chat-info-tab::-webkit-scrollbar),
:deep(.chat-agents-tab::-webkit-scrollbar) {
  width: 6px;
}

:deep(.chat-info-tab::-webkit-scrollbar-track),
:deep(.chat-agents-tab::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.chat-info-tab::-webkit-scrollbar-thumb),
:deep(.chat-agents-tab::-webkit-scrollbar-thumb) {
  background: rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 3px;
}

:deep(.chat-info-tab::-webkit-scrollbar-thumb:hover),
:deep(.chat-agents-tab::-webkit-scrollbar-thumb:hover) {
  background: rgba(var(--v-theme-on-surface), 0.3);
}
</style>