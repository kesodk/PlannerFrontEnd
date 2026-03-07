import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiBaseUrl } from '../config/apiConfig'

const API_BASE_URL = getApiBaseUrl()
const TOKEN_KEY = 'auth_token'

export interface Modulperiode {
  id: number
  kode: string
  startdato: string
  slutdato: string
  status: 'Igangværende' | 'Fremtidig' | 'Afsluttet'
}

export const modulperiodeKeys = {
  all: ['modulperioder'] as const,
}

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
    headers: { ...headers, ...options.headers },
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = `HTTP ${response.status}`
    try {
      const errorJson = JSON.parse(errorText)
      errorMessage = errorJson.message || errorJson.error || errorMessage
    } catch {
      errorMessage = errorText || errorMessage
    }
    throw new Error(errorMessage)
  }

  if (response.status === 204) return undefined as T
  return response.json()
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useModulperioder() {
  return useQuery({
    queryKey: modulperiodeKeys.all,
    queryFn: () => authenticatedFetch<Modulperiode[]>('/modulperioder'),
  })
}

export function useCreateModulperiode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { kode: string; startdato: string; slutdato: string }) =>
      authenticatedFetch<Modulperiode>('/modulperioder', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modulperiodeKeys.all })
    },
  })
}

export function useUpdateModulperiode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ kode: string; startdato: string; slutdato: string }> }) =>
      authenticatedFetch<Modulperiode>(`/modulperioder/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modulperiodeKeys.all })
    },
  })
}

export function useDeleteModulperiode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      authenticatedFetch<void>(`/modulperioder/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modulperiodeKeys.all })
    },
  })
}
