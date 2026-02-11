export type AssessmentResult = 
  | 'gennemført' 
  | 'ikke-gennemført' 
  | 'deltaget-uden-eksamen'
  | '12' | '10' | '7' | '4' | '02' | '00' | '-3'
  | '' // Tom værdi

export interface ModulePeriod {
  id: number
  studentId: number
  modulperiode: string // f.eks. "24-1-M1"
  fag: string // f.eks. "V1", "S1"
  fagbeskrivelse: string // f.eks. "Web Introduction"
  bedømmelse: AssessmentResult
}

export interface Subject {
  id: number
  navn: string
  beskrivelse?: string
}

export interface Assessment {
  id: number
  studentId: number
  subjectId: number
  subjectNavn: string
  dato: string
  resultat: AssessmentResult
  bemærkning?: string
  vejleder?: string
}

export interface StudentAssessmentHistory {
  studentId: number
  studentNavn: string
  assessments: Assessment[]
}
