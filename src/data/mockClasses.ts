import { generateModulperioder, filterValidModulperioder, sortModulperioder } from '../utils/modulperiodeUtils'

export interface ClassData {
  id: number
  navn: string
  afdeling: string
  lærer: string
  fag: string
  modulperiode: string
  startdato: string
  slutdato: string
  status: 'Igangværende' | 'Fremtidig' | 'Afsluttet'
  elevIds: number[]
}

export const mockClasses: ClassData[] = [
  {
    id: 1,
    navn: '26-1-M1-AspITLab S-LESI',
    afdeling: 'Trekanten',
    lærer: 'LESI',
    fag: 'AspITLab S',
    modulperiode: '26-1-M1',
    startdato: '2026-01-05',
    slutdato: '2026-02-28',
    status: 'Igangværende',
    elevIds: [1, 5]
  },
  {
    id: 2,
    navn: '26-1-M1-AspITLab V-JOES',
    afdeling: 'Trekanten',
    lærer: 'JOES',
    fag: 'AspITLab V',
    modulperiode: '26-1-M1',
    startdato: '2026-01-05',
    slutdato: '2026-02-28',
    status: 'Igangværende',
    elevIds: []
  },
  {
    id: 3,
    navn: '26-1-M1-S2-MARA',
    afdeling: 'Trekanten',
    lærer: 'MARA',
    fag: 'S2',
    modulperiode: '26-1-M1',
    startdato: '2026-01-05',
    slutdato: '2026-02-28',
    status: 'Igangværende',
    elevIds: []
  },
  {
    id: 4,
    navn: '26-1-M1-Praktik-JOES',
    afdeling: 'Trekanten',
    lærer: 'JOES',
    fag: 'Praktik',
    modulperiode: '26-1-M1',
    startdato: '2026-01-05',
    slutdato: '2026-02-28',
    status: 'Igangværende',
    elevIds: []
  },
  {
    id: 5,
    navn: '26-1-M1-V2-KESO',
    afdeling: 'Trekanten',
    lærer: 'KESO',
    fag: 'V2',
    modulperiode: '26-1-M1',
    startdato: '2026-01-05',
    slutdato: '2026-02-28',
    status: 'Igangværende',
    elevIds: []
  },
  {
    id: 6,
    navn: '25-2-M3-V3.1 web-KESO',
    afdeling: 'Østjylland',
    lærer: 'KESO',
    fag: 'V3.1 web',
    modulperiode: '25-2-M3',
    startdato: '2025-11-01',
    slutdato: '2025-12-20',
    status: 'Afsluttet',
    elevIds: [2, 4]
  },
  {
    id: 7,
    navn: '25-2-M2-S3-MARA',
    afdeling: 'Sønderjylland',
    lærer: 'MARA',
    fag: 'S3',
    modulperiode: '25-2-M2',
    startdato: '2025-09-01',
    slutdato: '2025-10-31',
    status: 'Afsluttet',
    elevIds: [3]
  },
  {
    id: 8,
    navn: '26-2-M1-V3.2 cms-LESI',
    afdeling: 'Trekanten',
    lærer: 'LESI',
    fag: 'V3.2 cms',
    modulperiode: '26-2-M1',
    startdato: '2026-08-15',
    slutdato: '2026-10-15',
    status: 'Fremtidig',
    elevIds: []
  },
  {
    id: 9,
    navn: '26-2-M2-T3-HENS',
    afdeling: 'Storkøbenhavn',
    lærer: 'HENS',
    fag: 'T3',
    modulperiode: '26-2-M2',
    startdato: '2026-10-20',
    slutdato: '2026-12-18',
    status: 'Fremtidig',
    elevIds: []
  },
  {
    id: 10,
    navn: '26-1-M2-QA-NIBU',
    afdeling: 'Trekanten',
    lærer: 'NIBU',
    fag: 'QA',
    modulperiode: '26-1-M2',
    startdato: '2026-03-01',
    slutdato: '2026-05-31',
    status: 'Fremtidig',
    elevIds: []
  },
  {
    id: 11,
    navn: '26-1-M2-UP1-NAHV',
    afdeling: 'Sønderjylland',
    lærer: 'NAHV',
    fag: 'UP1',
    modulperiode: '26-1-M2',
    startdato: '2026-03-01',
    slutdato: '2026-05-31',
    status: 'Fremtidig',
    elevIds: []
  }
]

export const availableTeachers = [
  { initials: 'MARA', name: 'Mads Rasmussen' },
  { initials: 'JOES', name: 'Jonni Espersen' },
  { initials: 'LESI', name: 'Lene-Maria Simonsen' },
  { initials: 'KESO', name: 'Kenneth Sørensen' },
  { initials: 'HENS', name: 'Henrik Stephansen' },
  { initials: 'NIBU', name: 'Niels Bundgaard' },
  { initials: 'NAHV', name: 'Nadja Hviid' }
]

export const availableFag = [
  'V1', 'V2', 'V3.1 web', 'V3.2 cms',
  'S1', 'S2', 'S3', 'S4.1 DS', 'S4.2 AD',
  'QA', 'Praktik', 'AspIN',
  'T1', 'T2', 'T3',
  'Afklaring', 'UP1', 'UP2',
  'AspITLab', 'AspITLab V', 'AspITLab S', 'AspITLab T'
]

// Generer modulperioder dynamisk - kun fremtidige og igangværende
const allModulperioder = generateModulperioder(2)
export const availableModulperioder = sortModulperioder(
  filterValidModulperioder(allModulperioder),
  false // Sorter stigende (ældste først)
)
