export interface EvaluationGoal {
  individueleMål: string
  læringsmål: string
  indholdOgHandlinger: string
  opfyldelseskriterier: string
}

export interface SummativeEvaluation {
  fagligt: string
  personligt: string
  socialt: string
  arbejdsmæssigt: string
  øvrigEvaluering: string
}

export interface Evaluation {
  id: number
  studentId: number
  holdId: number
  type: 'Formativ' | 'Summativ'
  dato: string
  modulperiode: string
  oprettetAf: string
  fagligtMål: EvaluationGoal
  personligtMål: EvaluationGoal
  socialtMål: EvaluationGoal
  arbejdsmæssigtMål: EvaluationGoal
  evalueringSenesteMål: string
  næsteModulPrioritet1: string
  næsteModulPrioritet2: string
  næsteModulPrioritet3: string
  bemærkninger?: string
  elevensEvaluering?: SummativeEvaluation
  lærerensEvaluering?: SummativeEvaluation
}
