import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiBaseUrl } from '../config/apiConfig'

const API_BASE_URL = getApiBaseUrl()
const TOKEN_KEY = 'auth_token'

async function authenticatedFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`)
  }

  return response.json()
}

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

export interface OversigterElev {
  id: number
  navn: string
  afdeling: string
  startdato: string
  spor: string
  nuv_hold: string | null
  nuv_hold_fag: string | null
  nuv_hold_id: number | null
  prioritet_1: string | null
  prioritet_2: string | null
  prioritet_3: string | null
  eval_dato: string | null
  eval_modulperiode: string | null
  tildelt_fag: string | null
  selection_id: number | null
  til_modulperiode: string | null
  overfort: boolean
}

export interface AktivitetsplanRad {
  fag: string
  sum: number
  [afdeling: string]: number | string
}

export interface Aktivitetsplan {
  afdelinger: string[]
  fag_liste: AktivitetsplanRad[]
  afd_totals: AktivitetsplanRad
  afd_elev_totals: AktivitetsplanRad
}

// ──────────────────────────────────────────────────────────────────────────────
// Standard fag-liste (matches backend)
// ──────────────────────────────────────────────────────────────────────────────
export const ASPIT_FAG = [
  'Udd. praktik',
  'Afklaring',
  'T1', 'V1', 'S1',
  'T2', 'V2', 'S2',
  'T3', 'V3.1 Web', 'V3.2 CMS', 'S3',
  'S4.1 DS', 'S4.2 AD',
  'AspitLab', 'AspitLab T', 'AspitLab V', 'AspitLab S',
  'QA', 'Praktik', 'AspitN',
] as const

// ──────────────────────────────────────────────────────────────────────────────
// Semester calculation (pure frontend logic)
// Each "halvår" is one semester.
// Halvår 1 (forår): January–July
// Halvår 2 (efterår): August–December
// ──────────────────────────────────────────────────────────────────────────────
function halvaarIndex(date: Date): number {
  const y = date.getFullYear()
  const m = date.getMonth() // 0-indexed
  return m >= 7 ? y * 2 + 1 : y * 2
}

export function calculateSemester(startdato: string): number {
  const start = new Date(startdato)
  const now = new Date()
  const semester = halvaarIndex(now) - halvaarIndex(start) + 1
  return Math.max(1, semester)
}

// ──────────────────────────────────────────────────────────────────────────────
// Query keys
// ──────────────────────────────────────────────────────────────────────────────
export const oversigterKeys = {
  elever: (filters: { afdeling?: string; modulperiode?: string }) =>
    ['oversigter', 'elever', filters] as const,
  aktivitetsplan: (tilModulperiode: string) =>
    ['oversigter', 'aktivitetsplan', tilModulperiode] as const,
}

// ──────────────────────────────────────────────────────────────────────────────
// Hooks
// ──────────────────────────────────────────────────────────────────────────────

export function useOversigterElever(filters: { afdeling?: string; modulperiode?: string }) {
  return useQuery({
    queryKey: oversigterKeys.elever(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.afdeling) params.append('afdeling', filters.afdeling)
      if (filters.modulperiode) params.append('modulperiode', filters.modulperiode)
      const qs = params.toString()
      return authenticatedFetch<OversigterElev[]>(`/oversigter/elever${qs ? `?${qs}` : ''}`)
    },
    staleTime: 1000 * 60 * 2,
  })
}

export function useAktivitetsplan(tilModulperiode: string | undefined) {
  return useQuery({
    queryKey: oversigterKeys.aktivitetsplan(tilModulperiode ?? ''),
    queryFn: async () => {
      return authenticatedFetch<Aktivitetsplan>(
        `/oversigter/aktivitetsplan?til_modulperiode=${encodeURIComponent(tilModulperiode!)}`
      )
    },
    enabled: !!tilModulperiode,
    staleTime: 1000 * 60 * 2,
  })
}

export function useUpsertSelection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      student_id: number
      til_modulperiode: string
      afdeling: string
      tildelt_fag: string | null
    }) => {
      return authenticatedFetch('/oversigter/selections', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oversigter'] })
    },
  })
}

export function useOverfor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { afdeling: string; til_modulperiode: string }) => {
      return authenticatedFetch<{ message: string; count: number }>('/oversigter/overfor', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oversigter'] })
    },
  })
}
