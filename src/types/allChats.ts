/**
 * All Chats API Types
 *
 * Types for unified chats API that returns chats from all channels
 * - Unified chat list across all channels
 * - Channel information included in each chat
 * - Filtering and pagination support
 */

import type { BaseEntity, SenderType } from './api'

// Unified Chat Response (from new /chats API)
export interface UnifiedChatResponse extends BaseEntity {
  name: string
  external_id: string
  channel_id: string
  channel_name: string
  assigned_user_id: string | null
  last_message_ts: string | null
  last_sender_type: SenderType | null
  last_message: string | null
  meta_data: Record<string, unknown>
  extra_data: Record<string, unknown>
}

// Unified Chat List Response
export interface UnifiedChatsListResponse {
  chats: UnifiedChatResponse[]
  total_count: number
  has_more: boolean
}

// Filters for unified chats API
export interface UnifiedChatsFiltersParams {
  limit?: number
  offset?: number
  assigned_user_id?: string
  assigned?: boolean
  channel_id?: string
  [key: string]: unknown
}

// Channel option for selector
export interface ChannelOption {
  id: string
  name: string
  platform?: string
}

// Unified chats filters UI state
export interface UnifiedChatsState {
  selectedChannelId: string | null // null means "All channels"
  searchQuery: string
  filters: UnifiedChatsFiltersParams
}