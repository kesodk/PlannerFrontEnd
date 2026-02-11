/**
 * API Configuration
 * 
 * Skift mellem mock API (JSON Server) og rigtig backend her
 */

export const API_CONFIG = {
  // Sæt til 'mock' for at bruge JSON Server, 'real' for rigtig backend
  mode: 'mock' as 'mock' | 'real',
  
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
  
  // Rigtig API (din kollegas backend)
  realApi: {
    // Brug proxy i development, direkte URL i production
    baseUrl: import.meta.env.DEV 
      ? '/api' // Proxy i development (omgår CORS)
      : 'https://cv-pc-x-server:1102/api', // Direkte i production
    
    // Backend credentials (kun nødvendig for rigtig API)
    auth: {
      username: 'ApiUser',
      password: '6sLY2kOz4+L1IZGboOHlv52nfgkNk2aZAaygijy8NCw=',
      adUsername: 'cv\\keso'
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
  return API_CONFIG.mode === 'mock'
}
