/**
 * Teacher API Service
 * Bruger Laravel /api/teachers endpoints med Bearer token auth.
 * Samme authenticatedFetch-mønster som classApi.ts.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { getApiBaseUrl } from '../config/apiConfig'
import type { Teacher, TeacherPayload } from '../types/Teacher'

const API_BASE_URL = getApiBaseUrl()
const TOKEN_KEY = 'auth_token'

// ── Query keys ───────────────────────────────────────────────────────────────
export const teacherKeys = {
  all: ['teachers'] as const,
  detail: (id: number) => ['teachers', id] as const,
}

// ── Authenticated fetch helper ────────────────────────────────────────────────
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
    headers: { ...headers, ...(options.headers as Record<string, string> | undefined) },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`)
  }

  if (response.status === 204) return null as T
  return response.json()
}

// ── TanStack Query hooks ─────────────────────────────────────────────────────

export function useTeachers() {
  return useQuery({
    queryKey: teacherKeys.all,
    queryFn: () => authenticatedFetch<Teacher[]>('/teachers'),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateTeacher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TeacherPayload) =>
      authenticatedFetch<Teacher>('/teachers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.all })
      notifications.show({ title: 'Gemt', message: 'Læreren er oprettet', color: 'green' })
    },
    onError: (err: Error) => {
      notifications.show({ title: 'Fejl', message: err.message || 'Kunne ikke oprette læreren', color: 'red' })
    },
  })
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TeacherPayload> }) =>
      authenticatedFetch<Teacher>(`/teachers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.all })
      notifications.show({ title: 'Gemt', message: 'Læreren er opdateret', color: 'green' })
    },
    onError: (err: Error) => {
      notifications.show({ title: 'Fejl', message: err.message || 'Kunne ikke opdatere læreren', color: 'red' })
    },
  })
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      authenticatedFetch<void>(`/teachers/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.all })
      notifications.show({ title: 'Slettet', message: 'Læreren er slettet', color: 'orange' })
    },
    onError: (err: Error) => {
      notifications.show({ title: 'Fejl', message: err.message || 'Kunne ikke slette læreren', color: 'red' })
    },
  })
}
