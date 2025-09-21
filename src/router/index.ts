import { createRouter, createWebHistory } from 'vue-router'
import { authService } from '@/services/auth/authService'
import { useAuthStore } from '@/stores/auth'

// Cache for hasUsers result to prevent infinite loops
let hasUsersCache: { result: boolean; timestamp: number } | null = null
const CACHE_DURATION = 60000 // 1 minute cache

async function getCachedHasUsers(): Promise<boolean> {
  const now = Date.now()

  // Check if cache is valid
  if (hasUsersCache && (now - hasUsersCache.timestamp) < CACHE_DURATION) {
    return hasUsersCache.result
  }

  // Cache is invalid or doesn't exist, fetch new result
  try {
    const { has_users } = await authService.hasUsers()
    hasUsersCache = {
      result: has_users,
      timestamp: now
    }
    return has_users
  } catch (error) {
    console.error('Error checking hasUsers:', error)
    // If there's an error, don't cache and return false as fallback
    return false
  }
}

function clearHasUsersCache(): void {
  hasUsersCache = null
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'root',
      redirect: () => {
        const authStore = useAuthStore()
        const lastChannel = authStore.getLastVisitedChannel()
        return `/channel/${lastChannel}`
      }
    },
    // Auth routes
    {
      path: '/auth',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/LoginView.vue')
        },
        {
          path: 'signup',
          name: 'signup',
          component: () => import('@/views/SignupView.vue')
        }
      ]
    },
    // Onboarding routes
    {
      path: '/onboarding',
      component: () => import('@/layouts/SimpleLayout.vue'),
      children: [
        {
          path: 'getting-started',
          name: 'onboarding-getting-started',
          component: () => import('@/views/onboarding/GettingStarted.vue')
        },
        {
          path: 'create-channel',
          name: 'onboarding-create-channel',
          component: () => import('@/views/onboarding/CreateChannel.vue')
        },
        {
          path: 'setup-webhook',
          name: 'onboarding-setup-webhook',
          component: () => import('@/views/onboarding/SetupWebhook.vue')
        },
        {
          path: 'create-agent',
          name: 'onboarding-create-agent',
          component: () => import('@/views/onboarding/CreateAgent.vue')
        },
        {
          path: 'agent-token',
          name: 'onboarding-agent-token',
          component: () => import('@/views/onboarding/AgentTokenView.vue')
        }
      ]
    },
    // Main app routes (protected)
    {
      path: '/channel/:channelId',
      component: () => import('@/layouts/ChannelLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'channel',
          component: () => import('@/views/ChannelView.vue')
        },
        {
          path: 'chat/:chatId',
          name: 'chat',
          component: () => import('@/views/ChatView.vue')
        },
        {
          path: 'chat/:chatId/details',
          name: 'chat-details', 
          component: () => import('@/views/ChatDetailsView.vue')
        }
      ]
    },
    // Ruta temporal para Home mientras desarrollamos (protected)
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/Home.vue'),
      meta: { requiresAuth: true }
    }
  ],
})

// Authentication guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthRoute = to.path.startsWith('/auth')
  const isSignupRoute = to.path === '/auth/signup'
  const isOnboardingRoute = to.path.startsWith('/onboarding')
  
  // Inicializar autenticación en la primera navegación
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }
  
  try {
    // Verificar si el sistema tiene usuarios (con cache)
    const has_users = await getCachedHasUsers()
    
    // Si es ruta de auth, manejar lógica especial
    if (isAuthRoute) {
      // Si usuario ya está logueado, redirigir al dashboard
      if (authStore.isAuthenticated) {
        const lastChannel = authStore.getLastVisitedChannel()
        return next(`/channel/${lastChannel}`)
      }
      
      // Si es signup pero ya hay usuarios, redirigir a login
      if (isSignupRoute && has_users) {
        return next('/auth/login')
      }
      
      return next()
    }
    
    // Si es ruta de onboarding, permitir (ya viene de auth)
    if (isOnboardingRoute) {
      return next()
    }
    
    // Lógica para rutas que requieren autenticación
    if (requiresAuth) {
      // Si no hay usuarios en el sistema, redirigir a signup
      if (!has_users) {
        return next('/auth/signup')
      }

      // Si usuario no está autenticado, redirigir a login
      if (!authStore.isAuthenticated) {
        return next('/auth/login')
      }

      // Si es la ruta raíz y usuario autenticado, redirigir al último canal
      if (to.path === '/') {
        const lastChannel = authStore.getLastVisitedChannel()
        return next(`/channel/${lastChannel}`)
      }

      // Usuario autenticado y ruta protegida, continuar
      return next()
    }
    
    // Para rutas públicas, continuar
    next()
    
  } catch (error) {
    console.error('Error in auth guard:', error)
    // En caso de error, limpiar auth y redirigir a login
    authStore.clearUser()
    next('/auth/login')
  }
})

export default router
export { clearHasUsersCache }
