/**
 * Notification Audio Service
 *
 * Servicio para gestionar la reproducción de sonidos de notificación
 * - Manejo de permisos de audio del navegador
 * - Pre-carga de archivos de sonido
 * - Reproducción de notificaciones con manejo de errores
 * - Control de volumen y configuración
 */

export enum AudioPermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  PROMPT = 'prompt',
  UNKNOWN = 'unknown'
}

export interface NotificationAudioConfig {
  enabled: boolean
  volume: number // 0 to 1
  soundUrl: string
}

class NotificationService {
  private audio: HTMLAudioElement | null = null
  private permissionStatus: AudioPermissionStatus = AudioPermissionStatus.UNKNOWN
  private config: NotificationAudioConfig = {
    enabled: true,
    volume: 0.5,
    soundUrl: '/sounds/new-notification.mp3'
  }

  constructor() {
    this.initializeAudio()
    this.loadUserPreferences()
  }

  /**
   * Initialize audio element and preload sound
   */
  private initializeAudio(): void {
    try {
      this.audio = new Audio(this.config.soundUrl)
      this.audio.volume = this.config.volume
      this.audio.preload = 'auto'

      // Add event listeners for better error handling
      this.audio.addEventListener('canplaythrough', () => {
        console.log('Notification sound loaded and ready')
      })

      this.audio.addEventListener('error', (error) => {
        console.error('Error loading notification sound:', error)
      })
    } catch (error) {
      console.error('Failed to initialize notification audio:', error)
    }
  }

  /**
   * Load user preferences from localStorage
   */
  private loadUserPreferences(): void {
    try {
      const stored = localStorage.getItem('notification-audio-config')
      if (stored) {
        const savedConfig = JSON.parse(stored)
        this.config = { ...this.config, ...savedConfig }

        if (this.audio) {
          this.audio.volume = this.config.volume
        }
      }
    } catch (error) {
      console.error('Error loading audio preferences:', error)
    }
  }

  /**
   * Save user preferences to localStorage
   */
  private saveUserPreferences(): void {
    try {
      localStorage.setItem('notification-audio-config', JSON.stringify(this.config))
    } catch (error) {
      console.error('Error saving audio preferences:', error)
    }
  }

  /**
   * Request audio permissions from user
   */
  async requestAudioPermission(): Promise<AudioPermissionStatus> {
    try {
      // Check if user interaction is required
      if (!this.audio) {
        this.permissionStatus = AudioPermissionStatus.DENIED
        return this.permissionStatus
      }

      // Try to play a silent test sound to check permissions
      const testAudio = new Audio()
      testAudio.volume = 0
      testAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='

      await testAudio.play()
      this.permissionStatus = AudioPermissionStatus.GRANTED
    } catch (error) {
      // If autoplay is blocked, we need user interaction
      if (error instanceof Error && error.name === 'NotAllowedError') {
        this.permissionStatus = AudioPermissionStatus.DENIED
      } else {
        this.permissionStatus = AudioPermissionStatus.PROMPT
      }
    }

    return this.permissionStatus
  }

  /**
   * Play notification sound with user interaction (call this from user event)
   */
  async playWithUserInteraction(): Promise<boolean> {
    try {
      if (!this.audio || !this.config.enabled) {
        return false
      }

      await this.audio.play()
      this.permissionStatus = AudioPermissionStatus.GRANTED
      return true
    } catch (error) {
      console.error('Failed to play notification sound with user interaction:', error)
      this.permissionStatus = AudioPermissionStatus.DENIED
      return false
    }
  }

  /**
   * Play notification sound (main method)
   */
  async playNotification(): Promise<boolean> {
    try {
      if (!this.config.enabled || !this.audio) {
        return false
      }

      // Reset audio to beginning
      this.audio.currentTime = 0

      await this.audio.play()
      return true
    } catch (error) {
      console.error('Failed to play notification sound:', error)

      // If it fails, might be due to autoplay policy
      if (error instanceof Error && error.name === 'NotAllowedError') {
        this.permissionStatus = AudioPermissionStatus.DENIED
        console.warn('Audio playback blocked. User interaction required.')
      }

      return false
    }
  }

  /**
   * Enable/disable notifications
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled
    this.saveUserPreferences()
  }

  /**
   * Set volume (0 to 1)
   */
  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    this.config.volume = clampedVolume

    if (this.audio) {
      this.audio.volume = clampedVolume
    }

    this.saveUserPreferences()
  }

  /**
   * Get current configuration
   */
  getConfig(): NotificationAudioConfig {
    return { ...this.config }
  }

  /**
   * Get permission status
   */
  getPermissionStatus(): AudioPermissionStatus {
    return this.permissionStatus
  }

  /**
   * Check if notifications are ready to play
   */
  isReady(): boolean {
    return (
      this.config.enabled &&
      this.audio !== null &&
      this.permissionStatus === AudioPermissionStatus.GRANTED
    )
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio.src = ''
      this.audio = null
    }
  }
}

// Singleton instance
export const notificationService = new NotificationService()
export { NotificationService }