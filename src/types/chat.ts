/**
 * Chat Type Definitions
 * 
 * Tipos para las conversaciones individuales
 * Actualizados para sincronizar con la API
 */

import type { PlatformType } from './api'
import type { MessageResponse } from './channels'

export interface Chat {
  id: string
  channelId: string
  contactId: string
  contact: Contact
  lastMessage?: MessageResponse
  unreadCount: number
  isArchived: boolean
  isMuted: boolean
  isPinned: boolean
  labels: string[]
  createdAt: Date
  updatedAt: Date
  // Campos de la API
  customer_name?: string
  customer_phone?: string
  assigned_user_id?: string
  assigned_user_name?: string
  last_message?: string
  last_message_at?: string
  is_assigned: boolean
}

export interface Contact {
  id: string
  name: string
  phone?: string
  email?: string
  avatar?: string
  status: 'online' | 'offline' | 'away'
  lastSeen?: Date
  isBlocked: boolean
  notes?: string
  tags: string[]
}

export interface ChatFilter {
  type: 'all' | 'unread' | 'archived' | 'pinned' | 'muted' | 'assigned' | 'unassigned'
  search?: string
  labels?: string[]
  platform?: PlatformType
  assigned_user_id?: string
  assigned?: boolean
}

export interface ChatListItem {
  chat: Chat
  isSelected: boolean
  showPreview: boolean
}