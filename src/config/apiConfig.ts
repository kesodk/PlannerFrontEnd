/**
 * API Configuration
 * 
 * ✅ AKTIV: Egen Laravel MySQL Backend (Februar 2026)
 * 
 * Nuværende setup: Laravel API på http://localhost:8000/api
 * Database: MySQL via XAMPP
 * 
 * Mode indstillinger:
 * - 'mock' = JSON Server (kun local dev)
 * - 'static' = In-memory mock data (fungerer på Vercel)
 * - 'real' = Laravel backend (AKTIVERET)
 */

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
    baseUrl: 'http://localhost:8000/api',
    
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
