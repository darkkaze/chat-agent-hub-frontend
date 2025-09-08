import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/channel/whatsapp'
    },
    {
      path: '/channel/:channelId',
      component: () => import('@/layouts/ChannelLayout.vue'),
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
    // Ruta temporal para Home mientras desarrollamos
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/Home.vue')
    }
  ],
})

export default router
