// Service to manage notification backdrop using polling
class NotificationBackdropService {
  private backdrop: HTMLElement | null = null
  private checkInterval: number | null = null
  private isInitialized = false

  init() {
    if (this.isInitialized) return
    this.isInitialized = true

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.startPolling())
    } else {
      this.startPolling()
    }
  }

  private startPolling() {
    // Check every 100ms if notifications are present
    this.checkInterval = window.setInterval(() => {
      this.checkNotifications()
    }, 100)

    // Also check immediately
    this.checkNotifications()
  }

  private checkNotifications() {
    const notificationsContainer = document.querySelector('.mantine-Notifications-root')
    if (!notificationsContainer) return

    // Check for actual visible notification elements
    const visibleNotifications = notificationsContainer.querySelectorAll('.mantine-Notification-root')
    const hasVisibleNotifications = visibleNotifications.length > 0
    
    if (hasVisibleNotifications && !this.backdrop) {
      this.showBackdrop()
    } else if (!hasVisibleNotifications && this.backdrop) {
      this.hideBackdrop()
    }
  }

  private showBackdrop() {
    if (this.backdrop) return // Already shown

    this.backdrop = document.createElement('div')
    this.backdrop.className = 'notification-backdrop'
    document.body.appendChild(this.backdrop)
  }

  private hideBackdrop() {
    if (this.backdrop) {
      document.body.removeChild(this.backdrop)
      this.backdrop = null
    }
  }

  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    this.hideBackdrop()
    this.isInitialized = false
  }
}

// Create and initialize the service
const backdropService = new NotificationBackdropService()
backdropService.init()

export default backdropService
