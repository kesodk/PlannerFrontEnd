import { createContext, useContext, useEffect, useState } from 'react'

type ColorScheme = 'light' | 'dark'

interface ThemeContextType {
  colorScheme: ColorScheme
  toggleColorScheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize from localStorage or default to light
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    const stored = localStorage.getItem('mantine-color-scheme')
    return (stored as ColorScheme) || 'light'
  })

  // Save to localStorage whenever scheme changes
  useEffect(() => {
    localStorage.setItem('mantine-color-scheme', colorScheme)
  }, [colorScheme])

  const toggleColorScheme = () => {
    setColorScheme(current => current === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleColorScheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
