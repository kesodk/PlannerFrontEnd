import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { getApiBaseUrl } from '../config/apiConfig'

const API_BASE_URL = getApiBaseUrl()

export interface AuthUser {
  id: number
  initialer: string
  navn: string
  afdelinger: string[]
  isGuest: boolean
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (initialer: string, password: string) => Promise<void>
  loginAsGuest: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'auth_user'
const TOKEN_KEY = 'auth_token'

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

async function ensureSanctumToken(): Promise<void> {
  if (localStorage.getItem(TOKEN_KEY)) return
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@aspiring.dk', password: 'password123' }),
    })
    if (res.ok) {
      const { token } = await res.json()
      localStorage.setItem(TOKEN_KEY, token)
    }
  } catch {
    // token hentes næste gang
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser)
  const [isLoading, setIsLoading] = useState(false)

  // Ensure Sanctum token is available whenever a user is already logged in
  useEffect(() => {
    if (user) {
      ensureSanctumToken()
    }
  }, [])

  const persist = (u: AuthUser | null) => {
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    setUser(u)
  }

  const login = async (initialer: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/teacher-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialer: initialer.toUpperCase(), password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Forkerte initialer eller password')
      }

      const { teacher } = await res.json()
      await ensureSanctumToken()
      persist({
        id:         teacher.id,
        initialer:  teacher.initialer,
        navn:       teacher.navn,
        afdelinger: teacher.afdelinger ?? [],
        isGuest:    false,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loginAsGuest = () => {
    ensureSanctumToken()
    persist({
      id:         0,
      initialer:  'GÆST',
      navn:       'Gæst',
      afdelinger: [],
      isGuest:    true,
    })
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    persist(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
