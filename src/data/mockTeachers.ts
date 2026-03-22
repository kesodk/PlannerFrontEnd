import type { Teacher } from '../types/Teacher'

export const mockTeachers: Teacher[] = [
  {
    id: 1,
    navn: 'Brian Kristensen',
    initialer: 'BKR',
    email: 'bkr@aspit.dk',
    telefon: '40 12 34 56',
    afdelinger: ['Trekanten'],
    rolle: 'admin',
    aktiv: true,
  },
  {
    id: 2,
    navn: 'Mette Larsen',
    initialer: 'MEL',
    email: 'mel@aspit.dk',
    telefon: '51 23 45 67',
    afdelinger: ['Østjylland'],
    rolle: 'teacher',
    aktiv: true,
  },
  {
    id: 3,
    navn: 'Søren Hansen',
    initialer: 'SHN',
    email: 'shn@aspit.dk',
    telefon: '29 87 65 43',
    afdelinger: ['Trekanten'],
    rolle: 'teacher',
    aktiv: true,
  },
  {
    id: 4,
    navn: 'Lene Pedersen',
    initialer: 'LPD',
    email: 'lpd@aspit.dk',
    telefon: '60 11 22 33',
    afdelinger: ['Sønderjylland'],
    rolle: 'teacher',
    aktiv: false,
  },
]
