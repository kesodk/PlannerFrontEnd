import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Evaluation } from '../types/Evaluation'
import { apiService, triggerBlobDownload } from './api'

const EVALUATIONS_ENDPOINT = '/evaluations'

/**
 * Get all evaluations
 */
export function useEvaluations(filters?: {
  studentId?: number
  classId?: number
  type?: 'Formativ' | 'Summativ'
  modulperiode?: string
}) {
  return useQuery({
    queryKey: ['evaluations', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.studentId) params.append('student_id', filters.studentId.toString())
      if (filters?.classId) params.append('class_id', filters.classId.toString())
      if (filters?.type) params.append('type', filters.type)
      if (filters?.modulperiode) params.append('modulperiode', filters.modulperiode)
      
      const url = params.toString() 
        ? `${EVALUATIONS_ENDPOINT}?${params.toString()}`
        : EVALUATIONS_ENDPOINT
      
      const response: any = await apiService.getEvaluations(url)
      // Laravel API Resource returnerer { data: [...] }
      return Array.isArray(response) ? response : (response.data || [])
    },
  })
}

/**
 * Get single evaluation by ID
 */
export function useEvaluation(id: number) {
  return useQuery({
    queryKey: ['evaluations', id],
    queryFn: async () => {
      const response: any = await apiService.getEvaluation(id)
      // Laravel API Resource returnerer { data: {...} }
      return response.data || response
    },
    enabled: !!id,
  })
}

/**
 * Create new evaluation
 */
export function useCreateEvaluation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response: any = await apiService.createEvaluation(data)
      // Laravel API Resource returnerer { data: {...} }
      const result = response.data || response
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
    },
  })
}

/**
 * Update existing evaluation
 */
export function useUpdateEvaluation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Evaluation> & { id: number }) => {
      const response: any = await apiService.updateEvaluation(id, data)
      // Laravel API Resource returnerer { data: {...} }
      return response.data || response
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
      queryClient.invalidateQueries({ queryKey: ['evaluations', variables.id] })
    },
  })
}

/**
 * Delete evaluation
 */
export function useDeleteEvaluation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await apiService.deleteEvaluation(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
    },
  })
}

/**
 * Export evaluation as PDF or DOCX.
 * Triggers a browser file-download on success.
 */
export function useExportEvaluation() {
  return useMutation({
    mutationFn: async ({
      id,
      format,
      scope = 'formativ',
    }: {
      id: number
      format: 'pdf' | 'docx' | 'txt'
      scope?: 'formativ' | 'summativ'
    }) => {
      const { blob, filename } = await apiService.exportEvaluation(id, format, scope)
      triggerBlobDownload(blob, filename)
    },
  })
}
