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
    if (process.client) {
      const savedState = localStorage.getItem('sidebar-minimized')
      if (savedState) {
        isDesktopSidebarMinimized.value = JSON.parse(savedState)
      }
    }
  }
  
  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    isMobileSidebarOpen.value = !isMobileSidebarOpen.value
  }
  
  // Toggle desktop sidebar (minimize/expand)
  const toggleDesktopSidebar = () => {
    isDesktopSidebarMinimized.value = !isDesktopSidebarMinimized.value
    
    // Save to localStorage
    if (process.client) {
      localStorage.setItem('sidebar-minimized', JSON.stringify(isDesktopSidebarMinimized.value))
    }
  }
  
  // Main toggle function called from header
  const toggleSidebar = () => {
    if (isDesktop.value) {
      toggleDesktopSidebar()
    } else {
      toggleMobileSidebar()
    }
  }
  
  // Close mobile sidebar
  const closeMobileSidebar = () => {
    isMobileSidebarOpen.value = false
  }
  
  // Update screen size and handle responsive behavior
  const updateScreenSize = () => {
    const wasDesktop = isDesktop.value
    isDesktop.value = window.innerWidth >= 1024
    
    // If switching from mobile to desktop, close mobile sidebar
    if (!wasDesktop && isDesktop.value) {
      isMobileSidebarOpen.value = false
    }
  }
  
  return {
    // State
    isMobileSidebarOpen: readonly(isMobileSidebarOpen),
    isDesktopSidebarMinimized: readonly(isDesktopSidebarMinimized),
    isDesktop: readonly(isDesktop),
    
    // Methods
    toggleSidebar,
    toggleMobileSidebar,
    toggleDesktopSidebar,
    closeMobileSidebar,
    updateScreenSize,
    initializeDesktopSidebar,
  }
}