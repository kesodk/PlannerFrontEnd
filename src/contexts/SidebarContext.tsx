import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

interface SidebarContextType {
  desktopOpened: boolean
  mobileOpened: boolean
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ 
  children, 
  desktopOpened, 
  mobileOpened 
}: { 
  children: ReactNode
  desktopOpened: boolean
  mobileOpened: boolean
}) {
  return (
    <SidebarContext.Provider value={{ desktopOpened, mobileOpened }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
