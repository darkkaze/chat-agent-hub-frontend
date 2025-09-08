/**
 * Channel Type Definitions
 * 
 * Tipos para los canales de comunicación (WhatsApp, Telegram, etc.)
 */

export interface Channel {
  id: string
  name: string
  icon: string
  type: 'whatsapp' | 'telegram' | 'instagram' | 'facebook' | 'twitter'
  isActive: boolean
  isConnected: boolean
  notifications: number
  settings: ChannelSettings
}

export interface ChannelSettings {
  enabled: boolean
  autoReply: boolean
  businessHours: BusinessHours
  webhookUrl?: string
}

export interface BusinessHours {
  enabled: boolean
  timezone: string
  schedule: WeeklySchedule
}

export interface WeeklySchedule {
  [key: string]: DaySchedule // 'monday', 'tuesday', etc.
}

export interface DaySchedule {
  enabled: boolean
  start: string // "09:00"
  end: string   // "17:00"
}