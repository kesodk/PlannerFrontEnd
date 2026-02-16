import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiService, type StudentDTO } from './api'
import { isMockMode, isStaticMode } from '../config/apiConfig'
import { staticMockService } from './staticMockService'
import type { Student } from '../types/Student'

// Query keys
export const studentKeys = {
  all: ['students'] as const,
  detail: (id: number) => ['students', id] as const,
}

/**
 * Konverter API StudentDTO til vores interne Student type
 * (kun brugt når rigtig backend er aktiv)
 */
export function mapDtoToStudent(dto: StudentDTO): Student {
  return {
    id: dto.studentId,
    navn: dto.name,
    fødselsdato: dto.birthdate,
    cpr: dto.serialNumber,
    adresse: dto.address,
    telefonnr: dto.privatePhone,
    email: dto.privateEmail,
    forældreNavn: dto.parentNames,
    forældreTelefon: dto.parentPhones,
    forældreAdresse: dto.parentAddresses,
    forældreEmail: dto.parentEmails,
    
    // Uddannelse - her skal vi mappe departmentId og municipalityId
    afdeling: mapDepartmentIdToAfdeling(dto.departmentId),
    kursistnr: dto.unilogin,
    kommune: mapMunicipalityIdToKommune(dto.municipalityId),
    lovgrundlag: dto.funding === '13U' ? 'Privat' : dto.funding, // Map 13U til Privat
    vejlederNavn: dto.counselorName,
    vejlederTlf: dto.counselorPhone,
    vejlederEmail: dto.counselorEmail,
    startdato: dto.startDate,
    slutdato: dto.graduationDate,
    spor: dto.education,
    status: dto.status === 'indskrevet' ? 'Indskrevet' : 'UP/Afklaring',
  }
}

/**
 * Konverter vores interne Student type til API StudentDTO
 * (kun brugt når rigtig backend er aktiv)
 */
export function mapStudentToDto(student: Student): Omit<StudentDTO, 'studentId'> {
  return {
    name: student.navn,
    birthdate: student.fødselsdato,
    serialNumber: student.cpr || '',
    address: student.adresse,
    privatePhone: student.telefonnr || '',
    privateEmail: student.email || '',
    parentNames: student.forældreNavn || '',
    parentPhones: student.forældreTelefon || '',
    parentAddresses: student.forældreAdresse || '',
    parentEmails: student.forældreEmail || '',
    
    departmentId: mapAfdelingToDepartmentId(student.afdeling),
    education: student.spor,
    funding: student.lovgrundlag === 'Privat' ? '13U' : student.lovgrundlag as 'STU' | 'LAB' | '13U',
    status: student.status === 'Indskrevet' ? 'indskrevet' : 'UP/Afklaring',
    startDate: student.startdato,
    graduationDate: student.slutdato || '',
    municipalityId: mapKommuneToMunicipalityId(student.kommune),
    
    counselorName: student.vejlederNavn || '',
    counselorPhone: student.vejlederTlf || '',
    counselorEmail: student.vejlederEmail || '',
    
    unilogin: student.kursistnr || '',
  }
}

// Helper functions til mapping mellem ID'er og navne
// Disse kan tilpasses når du ved hvordan API'ets ID'er matcher
function mapDepartmentIdToAfdeling(id: number): 'Trekanten' | 'Østjylland' | 'Sønderjylland' | 'Storkøbenhavn' {
  const mapping: Record<number, 'Trekanten' | 'Østjylland' | 'Sønderjylland' | 'Storkøbenhavn'> = {
    1: 'Trekanten',
    2: 'Østjylland',
    3: 'Sønderjylland',
    4: 'Storkøbenhavn',
  }
  return mapping[id] || 'Trekanten'
}

function mapAfdelingToDepartmentId(afdeling: string): number {
  const mapping: Record<string, number> = {
    'Trekanten': 1,
    'Østjylland': 2,
    'Sønderjylland': 3,
    'Storkøbenhavn': 4,
  }
  return mapping[afdeling] || 1
}

function mapMunicipalityIdToKommune(id: number): string {
  // Dette skal tilpasses når du ved hvordan kommune-ID'er matcher
  // For nu returnerer vi bare en placeholder
  return `Kommune ${id}`
}

function mapKommuneToMunicipalityId(_kommune: string): number {
  // Dette skal tilpasses når du ved hvordan kommune-navne matcher ID'er
  // For nu returnerer vi bare 1
  return 1
}

/**
 * Hook til at hente alle studerende
 */
export function useStudents() {
  return useQuery({
    queryKey: studentKeys.all,
    queryFn: async () => {
      // Static mock (in-memory) - fungerer på Vercel
      if (isStaticMode()) {
        return await staticMockService.getStudents()
      }
      
      const data = await apiService.getStudents()
      
      // Mock API (JSON Server) og Laravel API bruger begge direkte Student format
      // Laravel backend returnerer allerede data med danske feltnavne (navn, fødselsdato, osv.)
      return data as unknown as Student[]
    },
    staleTime: 1000 * 60 * 5, // 5 minutter
  })
}

/**
 * Hook til at hente enkelt studerende
 */
export function useStudent(studentId: number) {
  return useQuery({
    queryKey: studentKeys.detail(studentId),
    queryFn: async () => {
      // Static mock (in-memory) - fungerer på Vercel
      if (isStaticMode()) {
        return await staticMockService.getStudent(studentId)
      }
      
      const data = await apiService.getStudent(studentId)
      
      // Mock API (JSON Server) og Laravel API bruger begge direkte Student format
      // Laravel backend returnerer allerede data med danske feltnavne (navn, fødselsdato, osv.)
      return data as unknown as Student
    },
    enabled: !!studentId,
  })
}

/**
 * Hook til at oprette studerende
 */
export function useCreateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (student: Omit<Student, 'id'>) => {
      // Static mock (in-memory) - fungerer på Vercel
      if (isStaticMode()) {
        return await staticMockService.createStudent(student)
      }
      
      // Mock API (JSON Server) og Laravel API bruger begge direkte Student format
      const created = await apiService.createStudent(student as any)
      return created as unknown as Student
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
    },
  })
}

/**
 * Hook til at opdatere studerende
 */
export function useUpdateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (student: Student) => {
      // Static mock (in-memory) - fungerer på Vercel
      if (isStaticMode()) {
        return await staticMockService.updateStudent(student.id, student)
      }
      
      // Mock API (JSON Server) og Laravel API bruger begge direkte Student format
      const updated = await apiService.updateStudent(student.id, student as any)
      return updated as unknown as Student
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(data.id) })
    },
  })
}

/**
 * Hook til at slette studerende
 */
export function useDeleteStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (studentId: number) => {
      // Static mock (in-memory) - fungerer på Vercel
      if (isStaticMode()) {
        await staticMockService.deleteStudent(studentId)
        return
      }
      
      await apiService.deleteStudent(studentId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
    },
  })
}
