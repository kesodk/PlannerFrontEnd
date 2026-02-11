import type { ModulePeriod } from '../types/Assessment'

/**
 * Mock data for modulperioder og bedømmelser
 */
export const mockModulePeriods: Record<number, ModulePeriod[]> = {
  // Anders Jensen (Student ID: 1)
  1: [
    { id: 1, studentId: 1, modulperiode: '24-1-M1', fag: 'V1', fagbeskrivelse: 'Web Introduction', bedømmelse: 'gennemført' },
    { id: 2, studentId: 1, modulperiode: '24-2-M1', fag: 'V1', fagbeskrivelse: 'Web Introduction', bedømmelse: '12' },
    { id: 3, studentId: 1, modulperiode: '24-2-M2', fag: 'S1', fagbeskrivelse: 'Programming Introduction', bedømmelse: 'gennemført' },
    { id: 4, studentId: 1, modulperiode: '24-2-M3', fag: 'T1', fagbeskrivelse: 'IT Introduction', bedømmelse: 'gennemført' },
    { id: 5, studentId: 1, modulperiode: '25-1-M1', fag: 'V2', fagbeskrivelse: 'Web Construction', bedømmelse: '12' },
    { id: 6, studentId: 1, modulperiode: '25-1-M2', fag: 'S2', fagbeskrivelse: 'Application Programming', bedømmelse: '12' },
    { id: 7, studentId: 1, modulperiode: '25-1-M3', fag: 'T2', fagbeskrivelse: 'IT Desktop, Server and Network', bedømmelse: 'gennemført' },
    { id: 8, studentId: 1, modulperiode: '25-2-M1', fag: 'V3.1 web', fagbeskrivelse: 'Web Development', bedømmelse: '12' },
    { id: 9, studentId: 1, modulperiode: '25-2-M2', fag: 'S3', fagbeskrivelse: 'Software Construction', bedømmelse: '' },
    { id: 10, studentId: 1, modulperiode: '25-2-M3', fag: 'AspItLab S', fagbeskrivelse: '', bedømmelse: '' },
    { id: 11, studentId: 1, modulperiode: '26-1-M1', fag: 'AspItLab S', fagbeskrivelse: '', bedømmelse: '' },
  ],
  
  // Sofia Nielsen (Student ID: 2)
  2: [
    { id: 12, studentId: 2, modulperiode: '24-1-M1', fag: 'V1', fagbeskrivelse: 'Web Introduction', bedømmelse: '10' },
    { id: 13, studentId: 2, modulperiode: '24-2-M1', fag: 'V1', fagbeskrivelse: 'Web Introduction', bedømmelse: '10' },
    { id: 14, studentId: 2, modulperiode: '24-2-M2', fag: 'S1', fagbeskrivelse: 'Programming Introduction', bedømmelse: '7' },
    { id: 15, studentId: 2, modulperiode: '24-2-M3', fag: 'T1', fagbeskrivelse: 'IT Introduction', bedømmelse: '10' },
    { id: 16, studentId: 2, modulperiode: '25-1-M1', fag: 'V2', fagbeskrivelse: 'Web Construction', bedømmelse: '12' },
    { id: 17, studentId: 2, modulperiode: '25-1-M2', fag: 'S2', fagbeskrivelse: 'Application Programming', bedømmelse: '7' },
    { id: 18, studentId: 2, modulperiode: '25-1-M3', fag: 'T2', fagbeskrivelse: 'IT Desktop, Server and Network', bedømmelse: '10' },
    { id: 19, studentId: 2, modulperiode: '25-2-M1', fag: 'V3.1 web', fagbeskrivelse: 'Web Development', bedømmelse: '' },
    { id: 20, studentId: 2, modulperiode: '25-2-M2', fag: 'S3', fagbeskrivelse: 'Software Construction', bedømmelse: '' },
  ],

  // Mohammed Ali (Student ID: 3)
  3: [
    { id: 21, studentId: 3, modulperiode: '24-1-M1', fag: 'V1', fagbeskrivelse: 'Web Introduction', bedømmelse: 'gennemført' },
    { id: 22, studentId: 3, modulperiode: '24-2-M1', fag: 'V1', fagbeskrivelse: 'Web Introduction', bedømmelse: '7' },
    { id: 23, studentId: 3, modulperiode: '24-2-M2', fag: 'S1', fagbeskrivelse: 'Programming Introduction', bedømmelse: '4' },
    { id: 24, studentId: 3, modulperiode: '24-2-M3', fag: 'T1', fagbeskrivelse: 'IT Introduction', bedømmelse: '7' },
    { id: 25, studentId: 3, modulperiode: '25-1-M1', fag: 'V2', fagbeskrivelse: 'Web Construction', bedømmelse: '7' },
    { id: 26, studentId: 3, modulperiode: '25-1-M2', fag: 'S2', fagbeskrivelse: 'Application Programming', bedømmelse: '' },
  ],

  // Emma Larsen (Student ID: 4)
  4: [
    { id: 27, studentId: 4, modulperiode: '24-1-M1', fag: 'V1', fagbeskrivelse: 'Web Introduction', bedømmelse: '12' },
    { id: 28, studentId: 4, modulperiode: '24-2-M1', fag: 'V1', fagbeskrivelse: 'Web Introduction', bedømmelse: '12' },
    { id: 29, studentId: 4, modulperiode: '24-2-M2', fag: 'S1', fagbeskrivelse: 'Programming Introduction', bedømmelse: '10' },
    { id: 30, studentId: 4, modulperiode: '24-2-M3', fag: 'T1', fagbeskrivelse: 'IT Introduction', bedømmelse: '12' },
    { id: 31, studentId: 4, modulperiode: '25-1-M1', fag: 'V2', fagbeskrivelse: 'Web Construction', bedømmelse: '10' },
    { id: 32, studentId: 4, modulperiode: '25-1-M2', fag: 'S2', fagbeskrivelse: 'Application Programming', bedømmelse: '12' },
    { id: 33, studentId: 4, modulperiode: '25-1-M3', fag: 'T2', fagbeskrivelse: 'IT Desktop, Server and Network', bedømmelse: '10' },
    { id: 34, studentId: 4, modulperiode: '25-2-M1', fag: 'V3.1 web', fagbeskrivelse: 'Web Development', bedømmelse: '12' },
    { id: 35, studentId: 4, modulperiode: '25-2-M2', fag: 'S3', fagbeskrivelse: 'Software Construction', bedømmelse: '' },
  ],

  // Lucas Petersen (Student ID: 5)
  5: [
    { id: 36, studentId: 5, modulperiode: '24-1-M1', fag: 'V1', fagbeskrivelse: 'Web Introduction', bedømmelse: '4' },
    { id: 37, studentId: 5, modulperiode: '24-2-M1', fag: 'V1', fagbeskrivelse: 'Web Introduction', bedømmelse: '7' },
    { id: 38, studentId: 5, modulperiode: '24-2-M2', fag: 'S1', fagbeskrivelse: 'Programming Introduction', bedømmelse: '4' },
    { id: 39, studentId: 5, modulperiode: '24-2-M3', fag: 'T1', fagbeskrivelse: 'IT Introduction', bedømmelse: 'gennemført' },
    { id: 40, studentId: 5, modulperiode: '25-1-M1', fag: 'V2', fagbeskrivelse: 'Web Construction', bedømmelse: '' },
  ],
}
