import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { API_CONFIG, getApiBaseUrl } from '../config/apiConfig'

const API_BASE_URL = getApiBaseUrl()
const TOKEN_KEY = 'auth_token'

export interface ClassData {
  id: number
  navn: string
  afdeling: string
  lærer: string
  fag: string
  modulperiode: string
  startdato: string
  slutdato: string
  status: 'Igangværende' | 'Fremtidig' | 'Afsluttet'
  students?: any[]
  teacher?: any
}

// Query keys
export const classKeys = {
  all: ['classes'] as const,
  detail: (id: number) => ['classes', id] as const,
}

/**
 * Authenticated fetch helper
 */
async function authenticatedFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`)
  }
  
  return response.json()
}

/**
 * Hook til at hente alle hold
 */
export function useClasses(filters?: { status?: string; afdeling?: string; modulperiode?: string }) {
  return useQuery({
    queryKey: [...classKeys.all, filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.afdeling) params.append('afdeling', filters.afdeling)
      if (filters?.modulperiode) params.append('modulperiode', filters.modulperiode)
      
      const queryString = params.toString()
      const endpoint = `/classes${queryString ? `?${queryString}` : ''}`
      
      return await authenticatedFetch<ClassData[]>(endpoint)
    },
    staleTime: 1000 * 60 * 5, // 5 minutter
  })
}

/**
 * Hook til at hente enkelt hold
 */
export function useClass(classId: number) {
  return useQuery({
    queryKey: classKeys.detail(classId),
    queryFn: async () => {
      return await authenticatedFetch<ClassData>(`/classes/${classId}`)
    },
    enabled: !!classId,
  })
}

/**
 * Hook til at oprette hold
 */
export function useCreateClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (classData: Omit<ClassData, 'id'>) => {
      return await authenticatedFetch<ClassData>('/classes', {
        method: 'POST',
        body: JSON.stringify(classData),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all })
    },
  })
}

/**
 * Hook til at opdatere hold
 */
export function useUpdateClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (classData: ClassData) => {
      return await authenticatedFetch<ClassData>(`/classes/${classData.id}`, {
        method: 'PUT',
        body: JSON.stringify(classData),
      })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: classKeys.all })
      queryClient.invalidateQueries({ queryKey: classKeys.detail(data.id) })
    },
  })
}

/**
 * Hook til at slette hold
 */
export function useDeleteClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (classId: number) => {
      await authenticatedFetch(`/classes/${classId}`, {
        method: 'DELETE',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all })
    },
  })
}

/**
 * Hook til at tilmelde elev til hold
 */
export function useEnrollStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ classId, studentId, enrollmentDate }: { classId: number; studentId: number; enrollmentDate?: string }) => {
      return await authenticatedFetch(`/classes/${classId}/enroll`, {
        method: 'POST',
        body: JSON.stringify({
          student_id: studentId,
          enrollment_date: enrollmentDate,
        }),
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.all })
      queryClient.invalidateQueries({ queryKey: classKeys.detail(variables.classId) })
    },
  })
}

/**
 * Hook til at framelde elev fra hold
 */
export function useUnenrollStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ classId, studentId }: { classId: number; studentId: number }) => {
      return await authenticatedFetch(`/classes/${classId}/unenroll/${studentId}`, {
        method: 'DELETE',
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.all })
      queryClient.invalidateQueries({ queryKey: classKeys.detail(variables.classId) })
    },
  })
}
