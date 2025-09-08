/**
 * User Type Definitions
 * 
 * Tipos para los usuarios del sistema
 */

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: UserRole
  permissions: Permission[]
  preferences: UserPreferences
  createdAt: Date
  lastLoginAt?: Date
}

export type UserRole = 'admin' | 'agent' | 'supervisor' | 'viewer'

export interface Permission {
  resource: string
  actions: string[] // ['read', 'write', 'delete']
}

export interface UserPreferences {
  language: string
  theme: 'light' | 'dark' | 'auto'
  notifications: NotificationSettings
  chatSettings: ChatPreferences
}

export interface NotificationSettings {
  desktop: boolean
  sound: boolean
  email: boolean
  mentions: boolean
}

export interface ChatPreferences {
  enterToSend: boolean
  showTimestamps: boolean
  showAvatars: boolean
  autoMarkAsRead: boolean
  typingIndicators: boolean
}

export interface TypingUser {
  userId: string
  name: string
  timestamp: Date
}