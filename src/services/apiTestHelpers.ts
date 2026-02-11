import type { StudentDTO } from './api'
import type { Student } from '../types/Student'

// Helper functions til test data og debugging

/**
 * Generer test StudentDTO objekt
 */
export function createTestStudentDTO(): Omit<StudentDTO, 'studentId'> {
  return {
    name: 'Test Elev',
    birthdate: '2005-01-15T00:00:00',
    serialNumber: '1234',
    address: 'Testvej 123, 7100 Vejle',
    privatePhone: '12345678',
    privateEmail: 'test@example.com',
    parentNames: 'Test Forælder',
    parentPhones: '87654321',
    parentAddresses: 'Testvej 123, 7100 Vejle',
    parentEmails: 'forælder@example.com',
    departmentId: 1,
    education: 'AspIT',
    funding: 'STU',
    status: 'UP/Afklaring',
    startDate: '2024-02-01',
    graduationDate: '2024-12-15',
    municipalityId: 1,
    counselorName: 'Test Vejleder',
    counselorPhone: '23456789',
    counselorEmail: 'vejleder@aspit.dk',
    unilogin: 'test1',
  }
}

/**
 * Log Student vs StudentDTO differences til debugging
 */
export function compareStudentFormats(student: Student, dto: StudentDTO): void {
  console.group('Student Format Comparison')
  console.log('Internal Student:', student)
  console.log('API StudentDTO:', dto)
  console.groupEnd()
}
