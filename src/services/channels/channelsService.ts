/**
 * Channels Service
 * 
 * Servicio para gestión de canales de comunicación
 * - CRUD de canales (WhatsApp, Telegram, etc.)
 * - Conexión/desconexión de canales
 * 
 * Endpoints mapeados:
 * - GET /channels
 * - POST /channels
 * - GET /channels/{channel_id}
 * - DELETE /channels/{channel_id}
 */

import { apiService } from '@/services/api'
import type {
  ChannelResponse,
  CreateChannelRequest
} from '@/types/channels'
import type { MessageResponse } from '@/types/api'

export class ChannelsService {
  async getChannels(): Promise<ChannelResponse[]> {
    return apiService.get<ChannelResponse[]>('/channels')
  }

  async createChannel(channelData: CreateChannelRequest): Promise<ChannelResponse> {
    return apiService.post<ChannelResponse>('/channels', channelData)
  }

  async getChannel(channelId: string): Promise<ChannelResponse> {
    return apiService.get<ChannelResponse>(`/channels/${channelId}`)
  }

  async deleteChannel(channelId: string): Promise<MessageResponse> {
    return apiService.delete<MessageResponse>(`/channels/${channelId}`)
  }
}

export const channelsService = new ChannelsService()