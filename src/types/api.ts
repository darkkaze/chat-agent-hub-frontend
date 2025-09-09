/**
 * Base API Types
 * 
 * Types generales para la comunicación con la API
 * - Response wrappers para paginación
 * - Error handling
 * - Enums globales
 */

// Response wrappers
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

export interface ApiError {
  detail: string
  type?: string
}

export interface MessageResponse {
  message: string
}

// Enums globales
export enum PlatformType {
  WHATSAPP = 'WHATSAPP',
  WHATSAPP_TWILIO = 'WHATSAPP_TWILIO',
  TELEGRAM = 'TELEGRAM',
  INSTAGRAM = 'INSTAGRAM'
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image', 
  DOCUMENT = 'document',
  AUDIO = 'audio',
  VIDEO = 'video'
}

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

// Base request/response types
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

export interface PaginationParams {
  limit?: number
  offset?: number
}