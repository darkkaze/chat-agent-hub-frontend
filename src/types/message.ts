/**
 * Message Type Definitions
 * 
 * Tipos para los mensajes dentro de los chats
 * Actualizados para sincronizar con la API
 */

import type { MessageType, MessageStatus } from './api'

export interface Message {
  id: string
  chatId: string
  senderId: string
  content: MessageContent
  type: MessageType
  status: MessageStatus
  timestamp: Date
  replyTo?: string
  reactions: Reaction[]
  isEdited: boolean
  isDeleted: boolean
  // Campos de la API
  is_from_customer?: boolean
}

// Re-exportar los enums de api.ts para mantener compatibilidad
export { MessageType, MessageStatus }

export interface MessageContent {
  text?: string
  attachment?: Attachment
  location?: LocationData
  contact?: ContactCard
}

export interface Attachment {
  id: string
  filename: string
  mimeType: string
  size: number
  url: string
  thumbnail?: string
  duration?: number // for audio/video
  dimensions?: { width: number; height: number } // for images/video
}

export interface LocationData {
  latitude: number
  longitude: number
  address?: string
}

export interface ContactCard {
  name: string
  phone?: string
  email?: string
}

export interface Reaction {
  emoji: string
  userId: string
  timestamp: Date
}

export interface MessageInput {
  text: string
  attachments: File[]
  replyTo?: string
}