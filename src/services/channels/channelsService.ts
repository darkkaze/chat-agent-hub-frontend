/**
 * Channels Service
 * 
 * Servicio para gestión de canales de comunicación
 * - CRUD de canales (WhatsApp, Telegram, etc.)
 * - Conexión/desconexión de canales
 * 
 * Endpoints mapeados:
 * - GET /channels
 * - GET /channels/platforms
 * - POST /channels
 * - GET /channels/{channel_id}
 * - PUT /channels/{channel_id}
 * - DELETE /channels/{channel_id}
 */

import { apiService } from '@/services/api'
import type {
  ChannelResponse,
  CreateChannelRequest,
  UpdateChannelRequest
} from '@/types/channels'
import type { ApiMessageResponse } from '@/types/api'

export class ChannelsService {
  async getChannels(): Promise<ChannelResponse[]> {
    return apiService.get<ChannelResponse[]>('/channels')
  }

  async getPlatforms(): Promise<string[]> {
    return apiService.get<string[]>('/channels/platforms')
  }

  async createChannel(channelData: CreateChannelRequest): Promise<ChannelResponse> {
    return apiService.post<ChannelResponse>('/channels', channelData)
  }

  async getChannel(channelId: string): Promise<ChannelResponse> {
    return apiService.get<ChannelResponse>(`/channels/${channelId}`)
  }

  async updateChannel(channelId: string, channelData: UpdateChannelRequest): Promise<ChannelResponse> {
    return apiService.put<ChannelResponse>(`/channels/${channelId}`, channelData)
  }

  async deleteChannel(channelId: string): Promise<ApiMessageResponse> {
    return apiService.delete<ApiMessageResponse>(`/channels/${channelId}`)
  }
}

export const channelsService = new ChannelsService()