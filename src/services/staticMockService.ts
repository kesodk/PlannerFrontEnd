import type { Student } from '../types/Student'
import { mockStudents as initialData, delay } from '../data/mockData'

/**
 * In-memory mock API for production deployment
 * Fungerer på Vercel og andre statiske hosting platforme
 */
class StaticMockService {
  private students: Student[] = []
  private nextId: number = 6

  constructor() {
    // Initialiser med mock data
    this.students = JSON.parse(JSON.stringify(initialData))
    this.nextId = Math.max(...this.students.map(s => s.id)) + 1
  }

  /**
   * Hent alle studerende
   */
  async getStudents(): Promise<Student[]> {
    await delay(100) // Simuler netværks-delay
    return JSON.parse(JSON.stringify(this.students))
  }

  /**
   * Hent enkelt studerende
   */
  async getStudent(id: number): Promise<Student> {
    await delay(50)
    const student = this.students.find(s => s.id === id)
    if (!student) {
      throw new Error(`Student with id ${id} not found`)
    }
    return JSON.parse(JSON.stringify(student))
  }

  /**
   * Opret ny studerende
   */
  async createStudent(student: Omit<Student, 'id'>): Promise<Student> {
    await delay(100)
    const newStudent: Student = {
      ...student,
      id: this.nextId++
    }
    this.students.push(newStudent)
    return JSON.parse(JSON.stringify(newStudent))
  }

  /**
   * Opdater studerende
   */
  async updateStudent(id: number, updates: Partial<Student>): Promise<Student> {
    await delay(100)
    const index = this.students.findIndex(s => s.id === id)
    if (index === -1) {
      throw new Error(`Student with id ${id} not found`)
    }
    this.students[index] = { ...this.students[index], ...updates, id }
    return JSON.parse(JSON.stringify(this.students[index]))
  }

  /**
   * Slet studerende
   */
  async deleteStudent(id: number): Promise<void> {
    await delay(100)
    const index = this.students.findIndex(s => s.id === id)
    if (index === -1) {
      throw new Error(`Student with id ${id} not found`)
    }
    this.students.splice(index, 1)
  }

  /**
   * Reset til initial data (for testing)
   */
  reset(): void {
    this.students = JSON.parse(JSON.stringify(initialData))
    this.nextId = Math.max(...this.students.map(s => s.id)) + 1
  }
}

// Export singleton instance
export const staticMockService = new StaticMockService()
