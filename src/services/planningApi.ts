import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiBaseUrl } from '../config/apiConfig'

const API_BASE_URL = getApiBaseUrl()
const TOKEN_KEY = 'auth_token'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PlanningStudent {
  id: number
  navn: string
}

export interface PinnedClass {
  id: number
  navn: string
  fag: string
  laerer: string
  afdeling: string
  modulperiode: string
  status: string
  studenter: PlanningStudent[]
}

export interface UgeplanDag {
  dag: 'mandag' | 'tirsdag' | 'onsdag' | 'torsdag' | 'fredag'
  formaal: string
  laeringsmaal: string
  indhold: string
  materialer: string
}

export interface Ugeplan {
  id: number
  class_id: number
  uge: number
  aar: number
  navn: string
  er_kladde: boolean
  dage: UgeplanDag[]
  studenter: PlanningStudent[]
  created_at: string
  updated_at: string
}

// ─── Fetch helper ────────────────────────────────────────────────────────────

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`API error (${response.status}): ${text || response.statusText}`)
  }
  if (response.status === 204) return null as T
  return response.json()
}

// ─── Query keys ──────────────────────────────────────────────────────────────

export const planningKeys = {
  pinnedClasses: (teacherId: number) => ['planning', 'pinned', teacherId] as const,
  ugeplaner: (classId: number | null, uge: number, aar: number) =>
    ['planning', 'ugeplaner', classId, uge, aar] as const,
  kladder: (classId: number | null) => ['planning', 'kladder', classId] as const,
}

// ─── Hooks: pinned classes ────────────────────────────────────────────────────

export function usePinnedClasses(teacherId: number | undefined) {
  return useQuery({
    queryKey: planningKeys.pinnedClasses(teacherId ?? 0),
    queryFn: () => apiFetch<PinnedClass[]>(`/planning/pinned-classes?teacher_id=${teacherId}`),
    enabled: !!teacherId,
  })
}

export function usePinClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ teacherId, classId }: { teacherId: number; classId: number }) =>
      apiFetch<PinnedClass>('/planning/pinned-classes', {
        method: 'POST',
        body: JSON.stringify({ teacher_id: teacherId, class_id: classId }),
      }),
    onSuccess: (_, { teacherId }) => {
      qc.invalidateQueries({ queryKey: ['planning', 'pinned', teacherId] })
    },
  })
}

export function useUnpinClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ teacherId, classId }: { teacherId: number; classId: number }) =>
      apiFetch<null>(`/planning/pinned-classes/${classId}?teacher_id=${teacherId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_, { teacherId }) => {
      qc.invalidateQueries({ queryKey: ['planning', 'pinned', teacherId] })
    },
  })
}

// ─── Hooks: ugeplaner ─────────────────────────────────────────────────────────

export function useUgeplaner(classId: number | null, uge: number, aar: number) {
  return useQuery({
    queryKey: planningKeys.ugeplaner(classId, uge, aar),
    queryFn: () =>
      apiFetch<Ugeplan[]>(`/planning/ugeplaner?class_id=${classId}&uge=${uge}&aar=${aar}&er_kladde=0`),
    enabled: !!classId,
  })
}

export function useKladder(classId: number | null) {
  return useQuery({
    queryKey: planningKeys.kladder(classId),
    queryFn: () =>
      apiFetch<Ugeplan[]>(`/planning/ugeplaner?class_id=${classId}&er_kladde=1`),
    enabled: !!classId,
  })
}

export function useCreateUgeplan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      class_id: number
      uge: number
      aar: number
      navn: string
      er_kladde?: boolean
    }) => apiFetch<Ugeplan>('/planning/ugeplaner', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: ['planning', 'ugeplaner', u.class_id] })
      qc.invalidateQueries({ queryKey: ['planning', 'kladder', u.class_id] })
    },
  })
}

export function useUpdateUgeplan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number
      navn?: string
      er_kladde?: boolean
      dage?: UgeplanDag[]
    }) =>
      apiFetch<Ugeplan>(`/planning/ugeplaner/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: ['planning', 'ugeplaner', u.class_id] })
      qc.invalidateQueries({ queryKey: ['planning', 'kladder', u.class_id] })
    },
  })
}

export function useDeleteUgeplan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: number; classId: number }) =>
      apiFetch<null>(`/planning/ugeplaner/${id}`, { method: 'DELETE' }),
    onSuccess: (_, { classId }) => {
      qc.invalidateQueries({ queryKey: ['planning', 'ugeplaner', classId] })
      qc.invalidateQueries({ queryKey: ['planning', 'kladder', classId] })
    },
  })
}

export function useSyncStudents() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, studentIds }: { id: number; studentIds: number[]; classId: number }) =>
      apiFetch<Ugeplan>(`/planning/ugeplaner/${id}/students`, {
        method: 'POST',
        body: JSON.stringify({ student_ids: studentIds }),
      }),
    onSuccess: (_u, variables) => {
      qc.invalidateQueries({ queryKey: ['planning', 'ugeplaner', variables.classId] })
      qc.invalidateQueries({ queryKey: ['planning', 'kladder', variables.classId] })
    },
  })
}
