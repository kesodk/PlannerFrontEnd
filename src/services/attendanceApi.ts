import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiBaseUrl } from '../config/apiConfig'

const API_BASE_URL = getApiBaseUrl()
const TOKEN_KEY = 'auth_token'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AttendanceRecord {
  id: number
  student_id: number
  class_id: number
  dato: string          // YYYY-MM-DD
  modetid: string       // HH:MM
  ga_tid: string        // HH:MM
  fravaerende_hele_dagen: boolean
  melding_modtaget: boolean
  melding_tidspunkt: string | null
  bevilget_fravaer: boolean
  note: string | null
  override_procent: number | null
  beregnet_procent: number   // calculated by backend
}

export interface StudentAttendanceEntry {
  student_id: number
  student_navn: string
  class_id: number
  dato: string
  er_fridag: boolean
  record: AttendanceRecord | null
}

export interface DayAttendance {
  dato: string
  er_weekend: boolean
  er_fri_fredag: boolean
  har_registreringer: boolean
  antal_registreret: number
  total_elever: number
  hold_procent: number | null
}

export interface AttendanceByDateResponse {
  dato: string
  class_id: number
  er_fridag: boolean
  elever: StudentAttendanceEntry[]
}

export interface AttendanceMonthResponse {
  class_id: number
  aar: number
  maaned: number
  total_elever: number
  dage: DayAttendance[]
}

export interface StudentStatsResponse {
  student_id: number
  class_id: number
  antal_registreringer: number
  fravaer_dage: number
  gennemsnit_procent: number | null
  records: AttendanceRecord[]
}

export interface UpsertAttendancePayload {
  student_id: number
  class_id: number
  dato: string
  modetid?: string
  ga_tid?: string
  fravaerende_hele_dagen?: boolean
  melding_modtaget?: boolean
  melding_tidspunkt?: string | null
  bevilget_fravaer?: boolean
  note?: string | null
  override_procent?: number | null
}

// ─── Query keys ───────────────────────────────────────────────────────────────

export const attendanceKeys = {
  byDate:       (classId: number, dato: string)  => ['attendance', 'day',   classId, dato] as const,
  byMonth:      (classId: number, aar: number, maaned: number) =>
                  ['attendance', 'month', classId, aar, maaned] as const,
  studentStats: (studentId: number, classId: number) =>
                  ['attendance', 'stats', studentId, classId] as const,
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`API Error (${response.status}): ${text || response.statusText}`)
  }
  if (response.status === 204) return undefined as T
  return response.json()
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Hent fremmøde for alle elever på et hold for en bestemt dato.
 */
export function useAttendanceByDate(classId: number, dato: string) {
  return useQuery({
    queryKey: attendanceKeys.byDate(classId, dato),
    queryFn: () =>
      apiFetch<AttendanceByDateResponse>(
        `/attendance?class_id=${classId}&dato=${dato}`
      ),
    enabled: !!classId && !!dato,
    staleTime: 1000 * 60,
  })
}

/**
 * Hent månedsoversigtens dag-statistikker for et hold.
 */
export function useAttendanceMonth(classId: number, aar: number, maaned: number) {
  return useQuery({
    queryKey: attendanceKeys.byMonth(classId, aar, maaned),
    queryFn: () =>
      apiFetch<AttendanceMonthResponse>(
        `/attendance/month?class_id=${classId}&aar=${aar}&maaned=${maaned}`
      ),
    enabled: !!classId,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Hent statistik for en elev på et hold.
 */
export function useStudentAttendanceStats(studentId: number, classId: number) {
  return useQuery({
    queryKey: attendanceKeys.studentStats(studentId, classId),
    queryFn: () =>
      apiFetch<StudentStatsResponse>(
        `/attendance/student-stats?student_id=${studentId}&class_id=${classId}`
      ),
    enabled: !!studentId && !!classId,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Opret eller opdater en attendance-record (upsert).
 */
export function useUpsertAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpsertAttendancePayload) =>
      apiFetch<AttendanceRecord>('/attendance', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, variables) => {
      const { class_id, dato } = variables
      const date = new Date(dato)
      queryClient.invalidateQueries({ queryKey: attendanceKeys.byDate(class_id, dato) })
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.byMonth(class_id, date.getFullYear(), date.getMonth() + 1),
      })
      if (variables.student_id) {
        queryClient.invalidateQueries({
          queryKey: attendanceKeys.studentStats(variables.student_id, class_id),
        })
      }
    },
  })
}

/**
 * Slet en attendance-record (nulstil fremmøde for en elev på en dato).
 */
export function useDeleteAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: number; class_id: number; student_id: number; dato: string }) =>
      apiFetch<void>(`/attendance/${id}`, { method: 'DELETE' }),
    onSuccess: (_data, variables) => {
      const { class_id, student_id, dato } = variables
      const date = new Date(dato)
      queryClient.invalidateQueries({ queryKey: attendanceKeys.byDate(class_id, dato) })
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.byMonth(class_id, date.getFullYear(), date.getMonth() + 1),
      })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.studentStats(student_id, class_id) })
    },
  })
}
