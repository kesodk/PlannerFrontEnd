import { API_CONFIG, getApiBaseUrl, isMockMode } from '../config/apiConfig'

// Get API base URL from config
const API_BASE_URL = getApiBaseUrl()

// Auth credentials (only used for real API)
const AUTH_CREDENTIALS = API_CONFIG.realApi.auth

// Token storage
const TOKEN_KEY = 'auth_token'

// ── Utility: extract filename from Content-Disposition ──────────────────────
function extractFilename(response: Response, fallback: string): string {
  const disposition = response.headers.get('Content-Disposition') ?? ''
  const match = disposition.match(/filename[^;=\n]*=["']?([^"';\n]+)["']?/i)
  return match?.[1]?.trim() ?? fallback
}

// ── Utility: trigger browser file download from blob ───────────────────────
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

export interface LoginRequest {
  email: string
  password: string
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

      // 204 No Content (e.g. DELETE) har ingen body
      if (retryResponse.status === 204) return null as T
      return retryResponse.json()
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API request failed (${response.status}): ${errorText || response.statusText}`)
    }

    // 204 No Content (e.g. DELETE) har ingen body
    if (response.status === 204) return null as T
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
   * === EVALUATIONS ===
   */

  /**
   * Transform camelCase keys to snake_case for backend
   */
  private toSnakeCase(obj: any): any {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.toSnakeCase(item))
    }

    const snakeCaseObj: any = {}
    const goalTypes = ['fagligtMål', 'personligtMål', 'socialtMål', 'arbejdsmæssigtMål']
    
    for (const [key, value] of Object.entries(obj)) {
      // Special mapping: holdId -> class_id
      if (key === 'holdId') {
        snakeCaseObj['class_id'] = value
        continue
      }

      // Special mapping: næste modul prioriteter (number suffix needs underscore)
      if (key === 'næsteModulPrioritet1') { snakeCaseObj['næste_modul_prioritet_1'] = value; continue }
      if (key === 'næsteModulPrioritet2') { snakeCaseObj['næste_modul_prioritet_2'] = value; continue }
      if (key === 'næsteModulPrioritet3') { snakeCaseObj['næste_modul_prioritet_3'] = value; continue }

      // Special mapping: evalueringSenesteMål -> evaluering_seneste_mål
      if (key === 'evalueringSenesteMål') { snakeCaseObj['evaluering_seneste_mål'] = value; continue }
      
      // Flatten nested goal objects: fagligtMål.individueleMål -> fagligt_individuelle_mål
      if (goalTypes.includes(key) && typeof value === 'object' && value !== null) {
        // fagligtMål -> fagligt, personligtMål -> personligt
        const prefix = key.replace(/Mål$/, '').toLowerCase()

        // Explicit sub-key mapping to match exact DB column names
        const subKeyMap: Record<string, string> = {
          'individueleMål': 'individuelle_mål',
          'læringsmål': 'læringsmål',
          'indholdOgHandlinger': 'indhold_og_handlinger',
          'opfyldelseskriterier': 'opfyldelseskriterier',
        }

        for (const [subKey, subValue] of Object.entries(value)) {
          const snakeSubKey = subKeyMap[subKey] ?? subKey
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .toLowerCase()
          snakeCaseObj[`${prefix}_${snakeSubKey}`] = subValue
        }
        continue
      }
      
      // Flatten elevensEvaluering: elevensEvaluering.fagligt -> elev_fagligt
      if (key === 'elevensEvaluering' && typeof value === 'object' && value !== null) {
        for (const [subKey, subValue] of Object.entries(value)) {
          if (subKey === 'øvrigEvaluering') {
            snakeCaseObj['elev_øvrig'] = subValue
          } else {
            const snakeSubKey = subKey
              .replace(/([a-z])([A-Z])/g, '$1_$2')
              .toLowerCase()
            snakeCaseObj[`elev_${snakeSubKey}`] = subValue
          }
        }
        continue
      }
      
      // Flatten lærerensEvaluering: lærerensEvaluering.fagligt -> lærer_fagligt
      if (key === 'lærerensEvaluering' && typeof value === 'object' && value !== null) {
        for (const [subKey, subValue] of Object.entries(value)) {
          if (subKey === 'øvrigEvaluering') {
            snakeCaseObj['lærer_øvrig'] = subValue
          } else {
            const snakeSubKey = subKey
              .replace(/([a-z])([A-Z])/g, '$1_$2')
              .toLowerCase()
            snakeCaseObj[`lærer_${snakeSubKey}`] = subValue
          }
        }
        continue
      }
      
      // Convert camelCase to snake_case for remaining fields
      const snakeKey = key
        .replace(/([a-z])([A-Z])/g, '$1_$2')  // Add _ before capital letters
        .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')  // Handle consecutive capitals
        .toLowerCase()
      
      // Don't recursively transform nested objects for special types above
      snakeCaseObj[snakeKey] = typeof value === 'object' && value !== null
        ? this.toSnakeCase(value)
        : value
    }
    return snakeCaseObj
  }

  /**
   * Hent alle evalueringer
   */
  async getEvaluations(endpoint: string = '/evaluations'): Promise<any[]> {
    return this.authenticatedFetch<any[]>(endpoint, {
      method: 'GET',
    })
  }

  /**
   * Hent enkelt evaluering
   */
  async getEvaluation(id: number): Promise<any> {
    return this.authenticatedFetch<any>(`/evaluations/${id}`, {
      method: 'GET',
    })
  }

  /**
   * Opret ny evaluering
   */
  async createEvaluation(evaluation: any): Promise<any> {
    // Transform camelCase to snake_case for backend
    const snakeCaseData = this.toSnakeCase(evaluation)
    
    return this.authenticatedFetch<any>('/evaluations', {
      method: 'POST',
      body: JSON.stringify(snakeCaseData),
    })
  }

  /**
   * Opdater evaluering
   */
  async updateEvaluation(id: number, evaluation: any): Promise<any> {
    // Transform camelCase to snake_case for backend
    const snakeCaseData = this.toSnakeCase(evaluation)
    
    return this.authenticatedFetch<any>(`/evaluations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(snakeCaseData),
    })
  }

  /**
   * Slet evaluering
   */
  async deleteEvaluation(id: number): Promise<void> {
    return this.authenticatedFetch<void>(`/evaluations/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Eksportér evaluering som PDF eller DOCX.
   * Returnerer blob + filnavn fra Content-Disposition headeren.
   */
  async exportEvaluation(
    id: number,
    format: 'pdf' | 'docx',
    scope: 'formativ' | 'summativ' | 'both' = 'formativ'
  ): Promise<{ blob: Blob; filename: string }> {
    const token = await this.ensureAuthenticated()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/evaluations/${id}/export`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ format, scope }),
    })

    if (response.status === 401 && !isMockMode()) {
      // Token udløbet – prøv igen
      this.token = null
      localStorage.removeItem(TOKEN_KEY)
      const newToken = await this.login()
      const retryResponse = await fetch(`${API_BASE_URL}/evaluations/${id}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${newToken}`,
        },
        body: JSON.stringify({ format, scope }),
      })
      if (!retryResponse.ok) {
        const text = await retryResponse.text()
        throw new Error(`Export fejlede (${retryResponse.status}): ${text}`)
      }
      const blob = await retryResponse.blob()
      const filename = extractFilename(retryResponse, `Evaluering.${format}`)
      return { blob, filename }
    }

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Export fejlede (${response.status}): ${text}`)
    }

    const blob = await response.blob()
    const filename = extractFilename(response, `Evaluering.${format}`)
    return { blob, filename }
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
