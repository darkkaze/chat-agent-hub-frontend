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
  <!-- Mobile & Tablet Portrait App Bar -->
  <v-app-bar 
    v-if="isMobileOrTabletPortrait" 
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
      {{ globalsStore.sidebarTitle }}
    </v-app-bar-title>
  </v-app-bar>

  <!-- Navigation Drawer -->
  <v-navigation-drawer
    :model-value="isMobileOrTabletPortrait ? mobileDrawer : drawer"
    @update:model-value="updateDrawerState"
    :rail="isCompact && !isMobileOrTabletPortrait"
    :permanent="!isMobileOrTabletPortrait"
    :width="isMobileOrTabletPortrait ? mobileDrawerWidth : drawerWidth"
    color="surface"
    elevation="1"
    class="border-e-sm"
  >
    <div class="d-flex flex-column h-100">
      <!-- Desktop Header -->
      <div v-if="!isMobileOrTabletPortrait" class="px-4 py-3">
        <v-list-item 
          :class="isCompact ? 'justify-center' : ''"
          density="compact"
        >
          <template v-if="!isCompact">
            <v-list-item-title class="text-h6 text-on-surface font-weight-bold">
              {{ globalsStore.sidebarTitle }}
            </v-list-item-title>
          </template>
          <template v-else>
            <v-avatar size="32" color="primary">
              <span class="text-white font-weight-bold">D</span>
            </v-avatar>
          </template>
        </v-list-item>
      </div>

      <!-- Mobile/Tablet Portrait Header -->
      <div v-else class="px-4 py-3">
        <v-list-item>
          <v-list-item-title class="text-h6 text-on-surface font-weight-bold">
            {{ globalsStore.sidebarTitle }}
          </v-list-item-title>
        </v-list-item>
      </div>

      <v-divider />

      <!-- Navigation Section -->
      <div class="px-2 py-2">
        <div
          v-for="(item, index) in allNavigationItems"
          :key="index"
          class="mb-2 d-flex"
          :class="isCompact && !isMobileOrTabletPortrait ? 'justify-center' : ''"
        >
          <v-tooltip
            v-if="isCompact && !isMobileOrTabletPortrait"
            location="end"
            :text="item.name"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :icon="item.icon"
                size="40"
                variant="text"
                color="on-surface"
                class="rounded-circle"
                style="min-width: 40px; width: 40px; height: 40px;"
                @click="handleNavigation(item)"
              />
            </template>
          </v-tooltip>

          <v-btn
            v-else
            :prepend-icon="item.icon"
            variant="text"
            color="on-surface"
            class="w-100 justify-start rounded-lg"
            @click="handleNavigation(item)"
          >
            {{ item.name }}
            <v-badge
              v-if="'notifications' in item && typeof item.notifications === 'number' && item.notifications > 0"
              :content="item.notifications"
              color="error"
              class="ms-auto"
            />
          </v-btn>
        </div>
      </div>

      <!-- Dynamic Applications Section -->
      <div v-if="menuStore.menuCount > 0" class="px-2 py-2">
        <v-divider class="mb-2" />

        <div
          v-for="(menuItem, index) in menuStore.menus"
          :key="menuItem.id"
          class="mb-2 d-flex"
          :class="isCompact && !isMobileOrTabletPortrait ? 'justify-center' : ''"
        >
          <v-tooltip
            v-if="isCompact && !isMobileOrTabletPortrait"
            location="end"
            :text="menuItem.name"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :icon="menuItem.icon"
                size="40"
                variant="text"
                color="on-surface"
                class="rounded-circle"
                style="min-width: 40px; width: 40px; height: 40px;"
                @click="navigateToExternalApp(menuItem.url)"
              />
            </template>
          </v-tooltip>

          <v-btn
            v-else
            :prepend-icon="menuItem.icon"
            variant="text"
            color="on-surface"
            class="w-100 justify-start rounded-lg"
            @click="navigateToExternalApp(menuItem.url)"
          >
            {{ menuItem.name }}
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
          :class="isCompact && !isMobileOrTabletPortrait ? 'justify-center' : ''"
        >
          <v-tooltip 
            v-if="isCompact && !isMobileOrTabletPortrait"
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
          v-if="!isMobileOrTabletPortrait"
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

  <!-- Mobile/Tablet Portrait Overlay -->
  <v-overlay 
    v-if="isMobileOrTabletPortrait && mobileDrawer"
    :model-value="mobileDrawer"
    scrim="rgba(0,0,0,0.3)"
    @click:outside="mobileDrawer = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { useAuthStore } from '@/stores/auth'
import { useGlobalsStore } from '@/stores/globals'

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
const router = useRouter()

// Stores
const menuStore = useMenuStore()
const authStore = useAuthStore()
const globalsStore = useGlobalsStore()

// Reactive screen width
const screenWidth = ref(window.innerWidth)

// Computed - Show app bar on screens smaller than 960px
const isMobileOrTabletPortrait = computed(() => {
  return screenWidth.value < 960
})

// Reactive state
const drawer = ref(true)
const mobileDrawer = ref(false)
const isCompact = ref(true) // Start in compact mode

// Constants
const drawerWidth = 200
const mobileDrawerWidth = computed(() => Math.floor(window.innerWidth * 0.7))

// Navigation sections
const mainNavigation = ref<Channel[]>([
  { id: 'all-chats', name: 'Chats', icon: 'mdi-chat-outline', active: true, notifications: 0 },
])

const adminActions = ref<Action[]>([
  { name: 'Canales', icon: 'mdi-broadcast' },
  { name: 'Usuarios', icon: 'mdi-account-group' },
  { name: 'Agentes', icon: 'mdi-robot' },
])

// Combined navigation items
const allNavigationItems = computed(() => [
  ...mainNavigation.value,
  ...adminActions.value
])

// Methods

const handleNavigation = (item: Channel | Action) => {
  // Close drawer when item is selected on mobile/tablet portrait
  if (isMobileOrTabletPortrait.value) {
    mobileDrawer.value = false
  }

  // Check if it's a channel item
  if ('id' in item) {
    // Reset all navigation items
    mainNavigation.value.forEach(ch => ch.active = false)
    // Set selected item as active
    item.active = true

    // Navigate based on channel type
    if (item.id === 'all-chats') {
      router.push('/chats')
    } else {
      router.push(`/channel/${item.id}`)
    }
  } else {
    // It's an admin action
    switch (item.name) {
      case 'Canales':
        router.push('/admin/channels')
        break
      case 'Usuarios':
        router.push('/admin/users')
        break
      case 'Agentes':
        router.push('/admin/agents')
        break
      default:
        console.log(`Action not implemented: ${item.name}`)
    }
  }
}

const openSettings = () => {
  // Close drawer when settings is selected on mobile/tablet portrait
  if (isMobileOrTabletPortrait.value) {
    mobileDrawer.value = false
  }

  // Navigate to user configuration
  router.push('/admin/config')
}

const toggleCompact = () => {
  isCompact.value = !isCompact.value
}

// Dynamic menu methods
const navigateToExternalApp = (url: string) => {
  // Close drawer when item is selected on mobile/tablet portrait
  if (isMobileOrTabletPortrait.value) {
    mobileDrawer.value = false
  }

  // Validar y navegar a la URL externa
  if (url.startsWith('/')) {
    // URL relativa - navegar en la misma ventana
    window.location.href = url
  } else {
    console.warn('Invalid menu URL:', url)
  }
}

const extractAppName = (url: string): string => {
  // Extraer nombre de la aplicación desde la URL
  // Ej: /analytics -> Analytics, /reports -> Reports
  const path = url.startsWith('/') ? url.slice(1) : url
  const segments = path.split('/')
  const appName = segments[0] || 'App'

  // Capitalizar primera letra
  return appName.charAt(0).toUpperCase() + appName.slice(1)
}

// Initialize dynamic menus when component mounts
const initializeDynamicMenus = async () => {
  const user = authStore.user
  if (user?.id) {
    try {
      await menuStore.initializeMenus(user.id)
    } catch (err) {
      console.error('Error initializing dynamic menus:', err)
    }
  }
}

// Methods for drawer state
const updateDrawerState = (value: boolean) => {
  if (isMobileOrTabletPortrait.value) {
    mobileDrawer.value = value
  } else {
    drawer.value = value
  }
}

// Handle window resize
const handleResize = () => {
  screenWidth.value = window.innerWidth
}

// Watch for breakpoint changes and update drawer state
watch(isMobileOrTabletPortrait, (newIsMobile) => {
  if (newIsMobile) {
    // Switching to mobile/tablet portrait - close drawer by default
    mobileDrawer.value = false
  } else {
    // Switching to desktop/tablet landscape - show drawer
    drawer.value = true
  }
})

// Watch for auth changes to initialize menus
watch(() => authStore.user, (newUser) => {
  if (newUser?.id) {
    initializeDynamicMenus()
  } else {
    // Clear menus when user logs out
    menuStore.clearUserData()
  }
})

// Lifecycle
onMounted(() => {
  // Add resize listener
  window.addEventListener('resize', handleResize)

  // Initialize dynamic menus if user is already loaded
  initializeDynamicMenus()
  
  // Set initial drawer state based on screen size
  drawer.value = !isMobileOrTabletPortrait.value
  // Desktop and tablet landscape start in compact mode
  if (!isMobileOrTabletPortrait.value) {
    isCompact.value = true
  }
})

onUnmounted(() => {
  // Clean up resize listener
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.v-navigation-drawer {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.v-navigation-drawer--rail {
  --v-navigation-drawer-width: 64px !important;
}

/* Dynamic applications styles - no custom styles needed for MDI icons */

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