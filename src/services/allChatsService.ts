/**
 * All Chats Service
 *
 * Service for unified chats API that retrieves chats from all channels
 * - Get all chats with optional filtering by channel
 * - Pagination and search support
 * - Maintains compatibility with existing channel-specific services
 *
 * Endpoints:
 * - GET /chats
 */

import { apiService, buildQueryParams } from '@/services/api'
import type {
  UnifiedChatsListResponse,
  UnifiedChatsFiltersParams,
  ChannelOption
} from '@/types/allChats'

// Basic channel response from API
interface ChannelResponse {
  id: string
  name: string
  platform?: string
}

export class AllChatsService {
  /**
   * Get all chats from all channels with optional filtering
   */
  async getAllChats(filters?: UnifiedChatsFiltersParams): Promise<UnifiedChatsListResponse> {
    const queryParams = filters ? buildQueryParams(filters) : ''
    return apiService.get<UnifiedChatsListResponse>(`/chats${queryParams}`)
  }

  /**
   * Get available channels for the selector
   * This uses the existing channels API to populate the selector options
   */
  async getChannelOptions(): Promise<ChannelOption[]> {
    try {
      // Using existing channels service to get available channels
      const channels = await apiService.get<ChannelResponse[]>('/channels')

      return channels.map(channel => ({
        id: channel.id,
        name: channel.name,
        platform: channel.platform
      }))
    } catch (error) {
      console.error('Error fetching channel options:', error)
      return []
    }
  }

  /**
   * Helper method to build filters for specific channel
   */
  buildChannelFilter(channelId: string | null, baseFilters?: UnifiedChatsFiltersParams): UnifiedChatsFiltersParams {
    const filters: UnifiedChatsFiltersParams = {
      ...baseFilters
    }

    if (channelId) {
      filters.channel_id = channelId
    }

    return filters
  }
}

export const allChatsService = new AllChatsService()