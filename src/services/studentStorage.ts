import type { Student } from '../types/Student'

const STUDENTS_STORAGE_KEY = 'student-admin-students'

export const studentStorage = {
  // Hent alle elever fra localStorage
  getStudents: (): Student[] => {
    try {
      const stored = localStorage.getItem(STUDENTS_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Fejl ved hentning af elever fra localStorage:', error)
      return []
    }
  },

  // Gem alle elever til localStorage
  saveStudents: (students: Student[]): void => {
    try {
      localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students))
    } catch (error) {
      console.error('Fejl ved gemning af elever til localStorage:', error)
    }
  },

  // Tilføj en ny elev
  addStudent: (student: Student): Student[] => {
    const students = studentStorage.getStudents()
    const newStudents = [...students, student]
    studentStorage.saveStudents(newStudents)
    return newStudents
  },

  // Opdater en eksisterende elev
  updateStudent: (updatedStudent: Student): Student[] => {
    const students = studentStorage.getStudents()
    const newStudents = students.map(s => 
      s.id === updatedStudent.id ? updatedStudent : s
    )
    studentStorage.saveStudents(newStudents)
    return newStudents
  },

  // Slet en elev
  deleteStudent: (studentId: number): Student[] => {
    const students = studentStorage.getStudents()
    const newStudents = students.filter(s => s.id !== studentId)
    studentStorage.saveStudents(newStudents)
    return newStudents
  },

  // Initialiser med mock data hvis localStorage er tom
  initializeWithMockData: (mockStudents: Student[]): Student[] => {
    const existing = studentStorage.getStudents()
    if (existing.length === 0) {
      studentStorage.saveStudents(mockStudents)
      return mockStudents
    }
    return existing
  },

  // Ryd alle data (til testing)
  clearAll: (): void => {
    localStorage.removeItem(STUDENTS_STORAGE_KEY)
  },

  // Få næste ledige ID
  getNextId: (): number => {
    const students = studentStorage.getStudents()
    return students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1
  }
}
