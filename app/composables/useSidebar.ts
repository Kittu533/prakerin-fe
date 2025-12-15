// composables/useSidebar.ts
export const useSidebar = () => {
  // Mobile sidebar state (show/hide)
  const isMobileSidebarOpen = useState('mobile-sidebar-open', () => false)
  
  // Desktop sidebar state (minimized/expanded) 
  const isDesktopSidebarMinimized = useState('desktop-sidebar-minimized', () => false)
  
  // Screen size detection
  const isDesktop = useState('is-desktop', () => false)
  
  // Initialize desktop sidebar state from localStorage
  const initializeDesktopSidebar = () => {
    if (import.meta.client) {
      const savedState = localStorage.getItem('sidebar-minimized')
      if (savedState) {
        isDesktopSidebarMinimized.value = JSON.parse(savedState)
      }
    }
  }
  
  // Toggle desktop sidebar (minimize/expand)
  const toggleDesktopSidebar = () => {
    isDesktopSidebarMinimized.value = !isDesktopSidebarMinimized.value
    if (import.meta.client) {
      localStorage.setItem('sidebar-minimized', JSON.stringify(isDesktopSidebarMinimized.value))
    }
  }
  
  // Main toggle function called from header
  const toggleSidebar = () => {
    if (isDesktop.value) {
      toggleDesktopSidebar()
    } else {
      isMobileSidebarOpen.value = !isMobileSidebarOpen.value
    }
  }
  
  // Close mobile sidebar
  const closeMobileSidebar = () => {
    isMobileSidebarOpen.value = false
  }
  
  // Update screen size
  const updateScreenSize = () => {
    const wasDesktop = isDesktop.value
    isDesktop.value = window.innerWidth >= 1024
    if (!wasDesktop && isDesktop.value) {
      isMobileSidebarOpen.value = false
    }
  }
  
  return {
    isMobileSidebarOpen,
    isDesktopSidebarMinimized,
    isDesktop,
    toggleSidebar,
    toggleDesktopSidebar,
    closeMobileSidebar,
    updateScreenSize,
    initializeDesktopSidebar,
  }
}
