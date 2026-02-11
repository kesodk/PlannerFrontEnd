import type { Evaluation } from '../types/Evaluation'

export const mockEvaluations: Evaluation[] = [
  {
    id: 1,
    studentId: 1,
    holdId: 5,
    type: 'Formativ',
    dato: '2026-01-27',
    modulperiode: '26-1-M1',
    oprettetAf: 'KESO',
    fagligtMål: {
      individueleMål: 'At gennemføre V2 med et tilfredsstillende resultat',
      læringsmål: 'Jeg har opnået alle fagets læringsmål',
      indholdOgHandlinger: 'Jeg følger undervisningen og løser de stillede opgaver',
      opfyldelseskriterier: 'Når jeg har bestået eksamen med et tilfredsstillende resultat'
    },
    personligtMål: {
      individueleMål: '',
      læringsmål: '',
      indholdOgHandlinger: '',
      opfyldelseskriterier: ''
    },
    socialtMål: {
      individueleMål: '',
      læringsmål: '',
      indholdOgHandlinger: '',
      opfyldelseskriterier: ''
    },
    arbejdsmæssigtMål: {
      individueleMål: 'Tørsted fra forrige modul',
      læringsmål: 'At arbejde med min staedighed omkring opgaveløsning, mere specifikt at søge hjælp tidligere.',
      indholdOgHandlinger: 'At forsøge i min hverdag at implementere forskellige strategier, som "tre-trins-raketten", med særlig fokus på de sidste 2 dele.\n\n(20 minutter til 1. del max)\n\nAt forsøge at spørge andre elever til hjælp, oftere.',
      opfyldelseskriterier: 'Når jeg i løbet af modulet har benyttet mig af en eller flere strategier i flere tilfælde.'
    },
    evalueringSenesteMål: '',
    næsteModulPrioritet1: 'S2',
    næsteModulPrioritet2: 'AspITLab S',
    næsteModulPrioritet3: 'AspITLab V',
    bemærkninger: 'Anders har vist stor interesse for serverprogrammering og ønsker at fortsætte i dette spor. AspITLab S vil give ham mulighed for at arbejde praktisk med de koncepter han har lært i S1.',
    elevensEvaluering: {
      fagligt: '',
      personligt: '',
      socialt: '',
      arbejdsmæssigt: '',
      øvrigEvaluering: ''
    },
    lærerensEvaluering: {
      fagligt: '',
      personligt: '',
      socialt: '',
      arbejdsmæssigt: '',
      øvrigEvaluering: ''
    }
  },
  {
    id: 2,
    studentId: 1,
    holdId: 5,
    type: 'Summativ',
    dato: '2025-12-15',
    modulperiode: '25-2-M3',
    oprettetAf: 'KESO',
    fagligtMål: {
      individueleMål: 'At gennemføre V3.1 web',
      læringsmål: 'Jeg har opnået alle fagets læringsmål',
      indholdOgHandlinger: 'Følge undervisningen og lave opgaverne',
      opfyldelseskriterier: 'Når jeg har bestået eksamen'
    },
    personligtMål: {
      individueleMål: '',
      læringsmål: '',
      indholdOgHandlinger: '',
      opfyldelseskriterier: ''
    },
    socialtMål: {
      individueleMål: '',
      læringsmål: '',
      indholdOgHandlinger: '',
      opfyldelseskriterier: ''
    },
    arbejdsmæssigtMål: {
      individueleMål: 'At blive bekendt med mine problemstillinger omkring at søge hjælp',
      læringsmål: 'At arbejde med min staedighed omkring opgaveløsning, mere specifikt at søge hjælp tidligere.',
      indholdOgHandlinger: 'At forsøge i min hverdag at implementere forskellige strategier, som "tre-trins-raketten".',
      opfyldelseskriterier: 'Når jeg i løbet af modulet har benyttet mig af en eller flere strategier i flere tilfælde.'
    },
    evalueringSenesteMål: '',
    næsteModulPrioritet1: 'V2',
    næsteModulPrioritet2: 'S2',
    næsteModulPrioritet3: 'T2',
    bemærkninger: '',
    elevensEvaluering: {
      fagligt: 'Jeg synes jeg har lært meget om webudvikling i dette modul.',
      personligt: '',
      socialt: '',
      arbejdsmæssigt: 'Jeg har arbejdet mere stabilt gennem hele modulet.',
      øvrigEvaluering: ''
    },
    lærerensEvaluering: {
      fagligt: 'Anders har vist god forståelse for fagets kernekompetencer.',
      personligt: '',
      socialt: '',
      arbejdsmæssigt: 'Anders har gjort fremskridt med at søge hjælp tidligere i processen.',
      øvrigEvaluering: 'Godt arbejde gennem modulet.'
    }
  },
  {
    id: 3,
    studentId: 2,
    holdId: 6,
    type: 'Formativ',
    dato: '2025-10-15',
    modulperiode: '25-2-M2',
    oprettetAf: 'JOES',
    fagligtMål: {
      individueleMål: 'At gennemføre S3 med godt resultat',
      læringsmål: 'Jeg har opnået alle fagets læringsmål',
      indholdOgHandlinger: 'Deltage aktivt i undervisningen',
      opfyldelseskriterier: 'Når jeg har bestået eksamen med mindst 7'
    },
    personligtMål: {
      individueleMål: '',
      læringsmål: '',
      indholdOgHandlinger: '',
      opfyldelseskriterier: ''
    },
    socialtMål: {
      individueleMål: '',
      læringsmål: '',
      indholdOgHandlinger: '',
      opfyldelseskriterier: ''
    },
    arbejdsmæssigtMål: {
      individueleMål: 'Forbedre samarbejde',
      læringsmål: 'At være mere åben overfor gruppearbejde',
      indholdOgHandlinger: 'Deltage aktivt i gruppeopgaver',
      opfyldelseskriterier: 'Når jeg har deltaget i mindst 3 gruppeprojekter'
    },
    evalueringSenesteMål: '',
    næsteModulPrioritet1: 'S4.1 DS',
    næsteModulPrioritet2: 'QA',
    næsteModulPrioritet3: 'V3.2 cms',
    bemærkninger: 'Sofia har vist interesse for databasedesign og ønsker at arbejde videre med backend-udvikling.',
    elevensEvaluering: {
      fagligt: '',
      personligt: '',
      socialt: '',
      arbejdsmæssigt: '',
      øvrigEvaluering: ''
    },
    lærerensEvaluering: {
      fagligt: '',
      personligt: '',
      socialt: '',
      arbejdsmæssigt: '',
      øvrigEvaluering: ''
    }
  }
]
