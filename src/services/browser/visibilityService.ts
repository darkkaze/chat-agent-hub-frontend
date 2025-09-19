/**
 * Browser Visibility Service
 *
 * Servicio para detectar si la pestaña/ventana del navegador está visible o enfocada
 * - Usa Document Visibility API para detectar cuando el usuario cambia de pestaña
 * - Proporciona estado reactivo para otros componentes
 * - Útil para notificaciones inteligentes
 */

export enum VisibilityState {
  VISIBLE = 'visible',
  HIDDEN = 'hidden',
  PRERENDER = 'prerender'
}

export interface BrowserVisibilityConfig {
  enableLogging: boolean
}

class BrowserVisibilityService {
  private isVisible = true
  private visibilityState: VisibilityState = VisibilityState.VISIBLE
  private listeners: Array<(isVisible: boolean, state: VisibilityState) => void> = []
  private config: BrowserVisibilityConfig = {
    enableLogging: false
  }

  constructor() {
    this.initializeVisibilityDetection()
  }

  /**
   * Initialize visibility detection using Document Visibility API
   */
  private initializeVisibilityDetection(): void {
    // Check initial state
    this.updateVisibilityState()

    // Listen for visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))

      // Also listen for focus/blur events as fallback
      window.addEventListener('focus', this.handleWindowFocus.bind(this))
      window.addEventListener('blur', this.handleWindowBlur.bind(this))

      if (this.config.enableLogging) {
        console.log('Browser visibility service initialized')
      }
    }
  }

  /**
   * Handle visibility change events
   */
  private handleVisibilityChange(): void {
    this.updateVisibilityState()
    this.notifyListeners()

    if (this.config.enableLogging) {
      console.log(`Visibility changed: ${this.isVisible ? 'visible' : 'hidden'} (${this.visibilityState})`)
    }
  }

  /**
   * Handle window focus events (fallback)
   */
  private handleWindowFocus(): void {
    if (!this.isVisible) {
      this.isVisible = true
      this.visibilityState = VisibilityState.VISIBLE
      this.notifyListeners()

      if (this.config.enableLogging) {
        console.log('Window focused')
      }
    }
  }

  /**
   * Handle window blur events (fallback)
   */
  private handleWindowBlur(): void {
    if (this.isVisible) {
      this.isVisible = false
      this.visibilityState = VisibilityState.HIDDEN
      this.notifyListeners()

      if (this.config.enableLogging) {
        console.log('Window blurred')
      }
    }
  }

  /**
   * Update internal visibility state from document
   */
  private updateVisibilityState(): void {
    if (typeof document !== 'undefined') {
      this.isVisible = !document.hidden && document.visibilityState === 'visible'
      this.visibilityState = (document.visibilityState as VisibilityState) || VisibilityState.VISIBLE
    }
  }

  /**
   * Notify all listeners of visibility changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.isVisible, this.visibilityState)
      } catch (error) {
        console.error('Error in visibility change listener:', error)
      }
    })
  }

  /**
   * Check if the page/tab is currently visible
   */
  getIsVisible(): boolean {
    return this.isVisible
  }

  /**
   * Get current visibility state
   */
  getVisibilityState(): VisibilityState {
    return this.visibilityState
  }

  /**
   * Check if the page is hidden (user switched tabs, minimized window, etc.)
   */
  getIsHidden(): boolean {
    return !this.isVisible
  }

  /**
   * Add listener for visibility changes
   */
  addVisibilityChangeListener(
    callback: (isVisible: boolean, state: VisibilityState) => void
  ): void {
    this.listeners.push(callback)
  }

  /**
   * Remove visibility change listener
   */
  removeVisibilityChangeListener(
    callback: (isVisible: boolean, state: VisibilityState) => void
  ): void {
    const index = this.listeners.indexOf(callback)
    if (index !== -1) {
      this.listeners.splice(index, 1)
    }
  }

  /**
   * Enable or disable logging
   */
  setLogging(enabled: boolean): void {
    this.config.enableLogging = enabled
  }

  /**
   * Get current configuration
   */
  getConfig(): BrowserVisibilityConfig {
    return { ...this.config }
  }

  /**
   * Check browser support for visibility API
   */
  isSupported(): boolean {
    return typeof document !== 'undefined' &&
           'visibilityState' in document &&
           'hidden' in document
  }

  /**
   * Cleanup event listeners
   */
  destroy(): void {
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
      window.removeEventListener('focus', this.handleWindowFocus.bind(this))
      window.removeEventListener('blur', this.handleWindowBlur.bind(this))
    }
    this.listeners = []

    if (this.config.enableLogging) {
      console.log('Browser visibility service destroyed')
    }
  }
}

// Singleton instance
export const visibilityService = new BrowserVisibilityService()
export { BrowserVisibilityService }