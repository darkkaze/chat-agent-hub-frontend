<!--
SidebarNavigation Component

Componente de navegación lateral principal de la aplicación.
Incluye:
- Header con logo/título (responsive mobile/desktop)
- Lista de canales (WhatsApp, Telegram, etc.)
- Acciones secundarias (Contactos, Plantillas, Estadísticas)
- Configuración y botón expandir/compactar
- Soporte para modo compacto en desktop
- Drawer temporal en mobile con overlay

Props: ninguno por ahora (usa stores para estado)
Emits: ninguno por ahora
-->

<template>
  <!-- Mobile App Bar -->
  <v-app-bar 
    v-if="$vuetify.display.mobile" 
    color="surface" 
    elevation="1"
    density="default"
  >
    <v-btn
      icon="mdi-menu"
      @click="mobileDrawer = !mobileDrawer"
      color="on-surface"
    />
    <v-app-bar-title class="text-on-surface font-weight-bold">
      Demo
    </v-app-bar-title>
  </v-app-bar>

  <!-- Navigation Drawer -->
  <v-navigation-drawer
    :model-value="$vuetify.display.mobile ? mobileDrawer : drawer"
    @update:model-value="updateDrawerState"
    :rail="isCompact && !$vuetify.display.mobile"
    :temporary="$vuetify.display.mobile"
    :width="$vuetify.display.mobile ? mobileDrawerWidth : drawerWidth"
    color="surface"
    elevation="1"
    class="border-e-sm"
  >
    <div class="d-flex flex-column h-100">
      <!-- Desktop Header -->
      <div v-if="!$vuetify.display.mobile" class="px-4 py-3">
        <v-list-item 
          :class="isCompact ? 'justify-center' : ''"
          density="compact"
        >
          <template v-if="!isCompact">
            <v-list-item-title class="text-h6 text-on-surface font-weight-bold">
              Demo
            </v-list-item-title>
          </template>
          <template v-else>
            <v-avatar size="32" color="primary">
              <span class="text-white font-weight-bold">D</span>
            </v-avatar>
          </template>
        </v-list-item>
      </div>

      <!-- Mobile Header -->
      <div v-else class="px-4 py-3">
        <v-list-item>
          <v-list-item-title class="text-h6 text-on-surface font-weight-bold">
            Demo
          </v-list-item-title>
        </v-list-item>
      </div>

      <v-divider />

      <!-- Channel Buttons Section -->
      <div class="px-2 py-2">
        <div 
          v-for="(channel, index) in channels" 
          :key="index"
          class="mb-2 d-flex"
          :class="isCompact && !$vuetify.display.mobile ? 'justify-center' : ''"
        >
          <v-tooltip 
            v-if="isCompact && !$vuetify.display.mobile"
            location="end"
            :text="channel.name"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :icon="channel.icon"
                size="40"
                variant="flat"
                :color="channel.active ? 'primary' : 'surface-variant'"
                class="rounded-circle"
                style="min-width: 40px; width: 40px; height: 40px;"
                @click="selectChannel(channel)"
              />
            </template>
          </v-tooltip>
          
          <v-btn
            v-else
            :prepend-icon="channel.icon"
            variant="flat"
            :color="channel.active ? 'primary' : 'surface-variant'"
            class="w-100 justify-start rounded-lg"
            @click="selectChannel(channel)"
          >
            {{ channel.name }}
            <v-badge 
              v-if="channel.notifications > 0"
              :content="channel.notifications"
              color="error"
              class="ms-auto"
            />
          </v-btn>
        </div>
      </div>

      <v-divider />

      <!-- Secondary Buttons Section -->
      <div class="px-2 py-2">
        <div 
          v-for="(action, index) in secondaryActions" 
          :key="index"
          class="mb-2 d-flex"
          :class="isCompact && !$vuetify.display.mobile ? 'justify-center' : ''"
        >
          <v-tooltip 
            v-if="isCompact && !$vuetify.display.mobile"
            location="end"
            :text="action.name"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :icon="action.icon"
                size="40"
                variant="text"
                color="on-surface"
                class="rounded-circle"
                style="min-width: 40px; width: 40px; height: 40px;"
                @click="handleAction(action)"
              />
            </template>
          </v-tooltip>
          
          <v-btn
            v-else
            :prepend-icon="action.icon"
            variant="text"
            color="on-surface"
            class="w-100 justify-start rounded-lg"
            @click="handleAction(action)"
          >
            {{ action.name }}
          </v-btn>
        </div>
      </div>

      <!-- Flex grow spacer -->
      <div style="flex-grow: 1;"></div>

      <v-divider />

      <!-- Bottom Buttons (Settings + Expand) -->
      <div class="px-2 py-2">
        <!-- Settings Button -->
        <div 
          class="d-flex mb-2"
          :class="isCompact && !$vuetify.display.mobile ? 'justify-center' : ''"
        >
          <v-tooltip 
            v-if="isCompact && !$vuetify.display.mobile"
            location="end"
            text="Configuración"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-cog"
                size="40"
                variant="text"
                color="on-surface"
                class="rounded-circle"
                style="min-width: 40px; width: 40px; height: 40px;"
                @click="openSettings"
              />
            </template>
          </v-tooltip>
          
          <v-btn
            v-else
            prepend-icon="mdi-cog"
            variant="text"
            color="on-surface"
            class="w-100 justify-start rounded-lg"
            @click="openSettings"
          >
            Configuración
          </v-btn>
        </div>

        <!-- Desktop Expand/Collapse Button -->
        <div 
          v-if="!$vuetify.display.mobile"
          class="d-flex"
          :class="isCompact ? 'justify-center' : ''"
        >
          <v-tooltip 
            v-if="isCompact"
            location="end"
            text="Expandir"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :icon="isCompact ? 'mdi-chevron-double-right' : 'mdi-chevron-double-left'"
                size="40"
                variant="text"
                color="primary"
                class="rounded-circle"
                style="min-width: 40px; width: 40px; height: 40px;"
                @click="toggleCompact"
              />
            </template>
          </v-tooltip>
          
          <v-btn
            v-else
            :prepend-icon="isCompact ? 'mdi-chevron-double-right' : 'mdi-chevron-double-left'"
            variant="text"
            color="primary"
            class="w-100 justify-start rounded-lg"
            @click="toggleCompact"
          >
            {{ isCompact ? 'Expandir' : 'Compacto' }}
          </v-btn>
        </div>
      </div>
    </div>
  </v-navigation-drawer>

  <!-- Mobile Overlay -->
  <v-overlay 
    v-if="$vuetify.display.mobile && mobileDrawer"
    :model-value="mobileDrawer"
    scrim="rgba(0,0,0,0.3)"
    @click:outside="mobileDrawer = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'

// Types
interface Channel {
  name: string
  icon: string
  active: boolean
  notifications: number
  id: string
}

interface Action {
  name: string
  icon: string
}

// Composables
const { mobile } = useDisplay()
const router = useRouter()

// Reactive state
const drawer = ref(true)
const mobileDrawer = ref(false)
const isCompact = ref(true) // Start in compact mode

// Constants
const drawerWidth = 200
const mobileDrawerWidth = computed(() => Math.floor(window.innerWidth * 0.7))

// Mock data - TODO: mover a store
const channels = ref<Channel[]>([
  { id: 'whatsapp', name: 'WhatsApp', icon: 'mdi-whatsapp', active: true, notifications: 5 },
  { id: 'telegram', name: 'Telegram', icon: 'mdi-telegram', active: false, notifications: 0 },
  { id: 'instagram', name: 'Instagram', icon: 'mdi-instagram', active: false, notifications: 2 },
  { id: 'facebook', name: 'Facebook', icon: 'mdi-facebook', active: false, notifications: 0 },
  { id: 'twitter', name: 'Twitter', icon: 'mdi-twitter', active: false, notifications: 1 },
])

const secondaryActions = ref<Action[]>([
  { name: 'Contactos', icon: 'mdi-account-group' },
  { name: 'Plantillas', icon: 'mdi-file-document' },
  { name: 'Estadísticas', icon: 'mdi-chart-line' },
])

// Methods
const selectChannel = (channel: Channel) => {
  // Reset all channels
  channels.value.forEach(ch => ch.active = false)
  // Set selected channel as active
  channel.active = true
  
  // Close mobile drawer when channel is selected
  if (mobile.value) {
    mobileDrawer.value = false
  }
  
  // Navigate to channel
  router.push(`/channel/${channel.id}`)
}

const handleAction = (action: Action) => {
  console.log('Action clicked:', action.name)
  
  // Close mobile drawer when action is selected
  if (mobile.value) {
    mobileDrawer.value = false
  }
}

const openSettings = () => {
  console.log('Settings clicked')
  
  // Close mobile drawer when settings is selected
  if (mobile.value) {
    mobileDrawer.value = false
  }
}

const toggleCompact = () => {
  isCompact.value = !isCompact.value
}

// Methods for drawer state
const updateDrawerState = (value: boolean) => {
  if (mobile.value) {
    mobileDrawer.value = value
  } else {
    drawer.value = value
  }
}

// Lifecycle
onMounted(() => {
  // Set initial drawer state based on screen size
  drawer.value = !mobile.value
  // Desktop starts in compact mode
  if (!mobile.value) {
    isCompact.value = true
  }
})
</script>

<style scoped>
.v-navigation-drawer {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.v-navigation-drawer--rail {
  --v-navigation-drawer-width: 64px !important;
}

.v-btn {
  transition: all 0.2s ease-in-out;
}

.v-btn:hover {
  transform: translateY(-1px);
}

.rounded-circle {
  border-radius: 50% !important;
}

.position-absolute {
  z-index: 1;
}
</style>