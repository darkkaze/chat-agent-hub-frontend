/**
 * Channels, Chats and Messages Types
 * 
 * Types para gestión de canales, chats y mensajes
 * - CRUD de canales
 * - Lista de chats con filtros
 * - Envío y recepción de mensajes
 * - Asignación de chats
 */

import type { BaseEntity, PaginatedResponse, PlatformType, MessageType, MessageStatus } from './api'

// Channel Types
export interface CreateChannelRequest {
  name: string
  platform: PlatformType
  credentials_to_send_message?: Record<string, any> // Depende de la plataforma
  api_to_send_message?: string
  buffer_time_seconds?: number
  history_msg_count?: number
  recent_msg_window_minutes?: number
}

export interface UpdateChannelRequest {
  name?: string
  api_to_send_message?: string
  buffer_time_seconds?: number
  history_msg_count?: number
  recent_msg_window_minutes?: number
}

export interface ChannelResponse extends BaseEntity {
  name: string
  platform: PlatformType
  api_to_send_message?: string
  buffer_time_seconds: number
  history_msg_count: number
  recent_msg_window_minutes: number
}

// Chat Types
export interface ChatResponse extends BaseEntity {
  name: string
  customer_name?: string
  customer_phone?: string
  assigned_user_id?: string
  assigned_user_name?: string
  last_message?: string
  last_message_at?: string
  unread_count: number
  is_assigned: boolean
  extra_data: Record<string, any>
}

export interface ChatListResponse extends PaginatedResponse<ChatResponse> {}

export interface ChatFiltersParams {
  limit?: number
  offset?: number
  assigned_user_id?: string | null
  assigned?: boolean | null
}

export interface AssignChatRequest {
  user_id: string
}

// Message Types
export interface MessageContent {
  text?: string
  media_url?: string
  media_type?: string
  document_url?: string
  document_name?: string
}

export interface MessageAttachment {
  type: 'image' | 'document' | 'audio' | 'video'
  url: string
  name?: string
  size?: number
  mime_type?: string
}

export interface SendMessageRequest {
  text: string
  attachments?: MessageAttachment[]
}

export interface MessageResponse extends BaseEntity {
  chat_id: string
  sender_id: string
  content: MessageContent
  message_type: MessageType
  timestamp: string
  status: MessageStatus
  is_from_customer: boolean
}

export interface ChatMessagesResponse extends PaginatedResponse<MessageResponse> {}

export interface MessagesFiltersParams {
  limit?: number
  offset?: number
}

// Typing indicator
export interface TypingUser {
  userId: string
  name: string
  timestamp: Date
}

// Chat status
export enum ChatStatus {
  OPEN = 'open',
  PENDING = 'pending',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}