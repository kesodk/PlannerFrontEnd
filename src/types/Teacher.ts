export type Department = 'Trekanten' | 'Østjylland' | 'Sønderjylland' | 'Storkøbenhavn'

/** Matcher Laravel API response for /api/teachers */
export interface Teacher {
  id: number
  initialer: string       // Unikke initialer, bruges til login (f.eks. "MAN")
  navn: string
  email: string
  telefon?: string
  afdelinger: Department[]  // En lærer kan dække flere afdelinger
  aktiv: boolean
}

/** Payload til POST /api/teachers og PUT /api/teachers/{id} */
export interface TeacherPayload {
  initialer: string
  navn: string
  email: string
  telefon?: string
  afdelinger: Department[]
  aktiv: boolean
  password?: string
}
