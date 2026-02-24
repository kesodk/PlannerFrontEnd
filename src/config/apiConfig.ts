/**
 * API Configuration
 * 
 * ✅ AKTIV: Egen Laravel MySQL Backend (Februar 2026)
 * 
 * Nuværende setup: Laravel API - port konfigureres via .env fil
 * Database: MySQL via XAMPP
 * 
 * Mode indstillinger:
 * - 'mock' = JSON Server (kun local dev)
 * - 'static' = In-memory mock data (fungerer på Vercel)
 * - 'real' = Laravel backend (AKTIVERET)
 * 
 * Port konfiguration:
 * - Sæt VITE_API_BASE_URL i .env fil (f.eks. http://localhost:8000)
 * - Default: http://localhost:8000
 */

// Hent backend base URL fra environment variable eller brug default
const getEnvApiBaseUrl = (): string => {
  // Vite exposed env vars starter med VITE_
  const envUrl = import.meta.env.VITE_API_BASE_URL
  return envUrl || 'http://localhost:8000'
}

export const API_CONFIG = {
  // Bruger nu Laravel backend
  mode: 'real' as 'mock' | 'static' | 'real',
  
  // Mock API (JSON Server)
  mockApi: {
    baseUrl: 'http://localhost:3001',
    // JSON Server bruger standard REST endpoints
    endpoints: {
      students: '/students',
      classes: '/classes',
      attendance: '/attendance',
    }
  },
  
  // ✅ AKTIVERET - Laravel MySQL Backend
  realApi: {
    baseUrl: `${getEnvApiBaseUrl()}/api`,
    
    // Laravel Sanctum credentials
    auth: {
      email: 'admin@aspiring.dk',
      password: 'password123'
    }
  }
}

/**
 * Get active API base URL based on mode
 */
export function getApiBaseUrl(): string {
  return API_CONFIG.mode === 'mock' 
    ? API_CONFIG.mockApi.baseUrl 
    : API_CONFIG.realApi.baseUrl
}

/**
 * Check if we're using mock API
 */
export function isMockMode(): boolean {
  return API_CONFIG.mode === 'mock' || API_CONFIG.mode === 'static'
}

/**
 * Check if we're using static mock data (in-memory)
 */
export function isStaticMode(): boolean {
  return API_CONFIG.mode === 'static'
}
