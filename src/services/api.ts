import { API_CONFIG, getApiBaseUrl, isMockMode } from '../config/apiConfig'

// Get API base URL from config
const API_BASE_URL = getApiBaseUrl()

// Auth credentials (only used for real API)
const AUTH_CREDENTIALS = API_CONFIG.realApi.auth

// Token storage
const TOKEN_KEY = 'auth_token'

export interface LoginRequest {
  username: string
  password: string
  adUsername: string
}

export interface LoginResponse {
  token: string
  expiresAt?: string
}

export interface StudentDTO {
  studentId: number
  name: string
  birthdate: string
  serialNumber: string // sidste fire i CPR
  address: string
  privatePhone: string
  privateEmail: string
  parentNames: string
  parentPhones: string
  parentAddresses: string
  parentEmails: string
  
  // Uddannelse
  departmentId: number
  education: 'AspIT' | 'AspIN'
  funding: 'STU' | 'LAB' | '13U'
  status: 'UP/Afklaring' | 'indskrevet'
  startDate: string
  graduationDate: string
  municipalityId: number
  
  // Vejleder
  counselorName: string
  counselorPhone: string
  counselorEmail: string
  
  // Unilogin
  unilogin: string // elevens fem-cifrede bruger
}

class ApiService {
  private token: string | null = null

  constructor() {
    // Hent token fra localStorage ved opstart
    this.token = localStorage.getItem(TOKEN_KEY)
  }

  /**
   * Login og hent authentication token
   */
  async login(): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(AUTH_CREDENTIALS),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Login failed (${response.status}): ${errorText || response.statusText}`)
      }

      const data: LoginResponse = await response.json()
      this.token = data.token
      localStorage.setItem(TOKEN_KEY, data.token)
      
      return data.token
    } catch (error) {
      console.error('Login error:', error)
      // Tilføj mere detaljer til fejlen
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error - check CORS or certificate settings')
      }
      throw error
    }
  }

  /**
   * Sikre at vi har et gyldigt token (kun for rigtig API)
   */
  private async ensureAuthenticated(): Promise<string | null> {
    // Skip authentication for mock API
    if (isMockMode()) {
      return null
    }
    
    if (!this.token) {
      await this.login()
    }
    return this.token!
  }

  /**
   * Generisk fetch med authentication
   */
  private async authenticatedFetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.ensureAuthenticated()

    // Headers afhænger af om vi bruger mock eller rigtig API
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Tilføj kun Authorization header hvis vi har et token (rigtig API)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // Merge med eventuelle custom headers
    if (options.headers) {
      Object.assign(headers, options.headers)
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    // Hvis unauthorized og rigtig API, prøv at login igen
    if (response.status === 401 && !isMockMode()) {
      this.token = null
      localStorage.removeItem(TOKEN_KEY)
      const newToken = await this.login()
      
      // Retry request med nyt token
      const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${newToken}`,
          ...options.headers,
        },
      })

      if (!retryResponse.ok) {
        const errorText = await retryResponse.text()
        throw new Error(`API request failed (${retryResponse.status}): ${errorText || retryResponse.statusText}`)
      }

      return retryResponse.json()
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API request failed (${response.status}): ${errorText || response.statusText}`)
    }

    return response.json()
  }

  /**
   * Hent alle studerende
   */
  async getStudents(): Promise<StudentDTO[]> {
    return this.authenticatedFetch<StudentDTO[]>('/students')
  }

  /**
   * Hent enkelt studerende
   */
  async getStudent(studentId: number): Promise<StudentDTO> {
    return this.authenticatedFetch<StudentDTO>(`/students/${studentId}`)
  }

  /**
   * Opret ny studerende
   */
  async createStudent(student: Omit<StudentDTO, 'studentId'>): Promise<StudentDTO> {
    return this.authenticatedFetch<StudentDTO>('/students', {
      method: 'POST',
      body: JSON.stringify(student),
    })
  }

  /**
   * Opdater studerende
   */
  async updateStudent(studentId: number, student: Partial<StudentDTO>): Promise<StudentDTO> {
    return this.authenticatedFetch<StudentDTO>(`/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(student),
    })
  }

  /**
   * Slet studerende
   */
  async deleteStudent(studentId: number): Promise<void> {
    return this.authenticatedFetch<void>(`/students/${studentId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Logout - ryd token
   */
  logout(): void {
    this.token = null
    localStorage.removeItem(TOKEN_KEY)
  }

  /**
   * Get current API base URL (for debugging)
   */
  getApiBaseUrl(): string {
    return API_BASE_URL
  }
}

// Export singleton instance
export const apiService = new ApiService()
