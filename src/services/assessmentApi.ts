import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiBaseUrl } from '../config/apiConfig'
import { triggerBlobDownload } from './api'

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

  if (response.status === 204) return undefined as T
  return response.json()
}

async function authenticatedFetchBlob(endpoint: string, options: RequestInit = {}, fallbackFilename = 'diplom.pdf'): Promise<{ blob: Blob; filename: string }> {
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

  const blob = await response.blob()
  const cd = response.headers.get('Content-Disposition') ?? ''
  const match = cd.match(/filename="?([^";\n]+)"?/)
  const filename = match?.[1] ?? fallbackFilename
  return { blob, filename }
}

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

export interface AssessmentRow {
  id?: number
  student_id: number
  class_id?: number | null
  modulperiode: string
  fag: string
  fagbeskrivelse: string
  bedømmelse: string
}

// ──────────────────────────────────────────────────────────────────────────────
// Query keys
// ──────────────────────────────────────────────────────────────────────────────

export const assessmentKeys = {
  history: (studentId: number) => ['assessments', 'history', studentId] as const,
}

// ──────────────────────────────────────────────────────────────────────────────
// Hooks
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Fetches the full assessment history for a student.
 * Returns rows derived from class enrollments + any saved assessment records.
 */
export function useAssessmentHistory(studentId: number | null) {
  return useQuery({
    queryKey: assessmentKeys.history(studentId ?? 0),
    queryFn: () =>
      authenticatedFetch<AssessmentRow[]>(`/students/${studentId}/assessments/history`),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Bulk-saves all assessment rows for a given student (upsert).
 */
export function useBulkSaveAssessments() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { student_id: number; rows: AssessmentRow[] }) => {
      return authenticatedFetch('/assessments/bulk', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.history(variables.student_id) })
    },
  })
}

/**
 * Downloads a diploma PDF or DOCX for the student.
 */
export function useExportDiploma() {
  return useMutation({
    mutationFn: async ({ studentId, format, studentName }: { studentId: number; format: 'pdf' | 'docx'; studentName: string }) => {
      const namePart = studentName.trim().replace(/\s+/g, '-')
      const fallback = `${namePart}-Diplom.${format}`
      const { blob, filename } = await authenticatedFetchBlob(
        `/students/${studentId}/assessments/diploma`,
        { method: 'POST', body: JSON.stringify({ format }) },
        fallback
      )
      triggerBlobDownload(blob, filename)
    },
  })
}
