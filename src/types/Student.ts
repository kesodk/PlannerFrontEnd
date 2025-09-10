// Student types and constants
export interface Student {
  id: number
  // Elevoplysninger
  navn: string
  fødselsdato: string
  cpr?: string
  adresse: string
  telefonnr?: string
  email?: string
  forældreNavn?: string
  forældreTelefon?: string
  forældreAdresse?: string
  forældreEmail?: string
  
  // Uddannelse
  afdeling: 'Trekanten' | 'Østjylland' | 'Sønderjylland' | 'Storkøbenhavn'
  kursistnr?: string
  kommune: string
  lovgrundlag: 'STU' | 'LAB' | 'Privat' | 'Andet'
  vejlederNavn?: string
  vejlederTlf?: string
  vejlederEmail?: string
  startdato: string
  slutdato?: string
  spor: 'AspIT' | 'AspIN'
  status: 'UP/Afklaring' | 'Indskrevet'
}

export const AFDELINGER = [
  { value: 'Trekanten', label: 'Trekanten' },
  { value: 'Østjylland', label: 'Østjylland' },
  { value: 'Sønderjylland', label: 'Sønderjylland' },
  { value: 'Storkøbenhavn', label: 'Storkøbenhavn' },
] as const

export const SPOR = [
  { value: 'AspIT', label: 'AspIT' },
  { value: 'AspIN', label: 'AspIN' },
] as const

export const LOVGRUNDLAG = [
  { value: 'STU', label: 'STU (Særlig tilrettelagt Ungdomsuddannelse)' },
  { value: 'LAB', label: 'LAB' },
  { value: 'Privat', label: 'Privat' },
  { value: 'Andet', label: 'Andet' },
] as const

export const STATUS = [
  { value: 'UP/Afklaring', label: 'UP/Afklaring' },
  { value: 'Indskrevet', label: 'Indskrevet' },
] as const

// Danske kommuner (udvalgte - kan udvides)
export const KOMMUNER = [
  'Vejle', 'Kolding', 'Fredericia', 'Billund', 'Hedensted', 'Middelfart', 'Tønder',
  'Haderslev', 'Aabenraa', 'Sønderborg', 'Varde', 'Esbjerg', 'Fanø', 'Vejen',
  'København', 'Frederiksberg', 'Dragør', 'Tårnby', 'Albertslund', 'Ballerup',
  'Brøndby', 'Gentofte', 'Gladsaxe', 'Glostrup', 'Herlev', 'Hvidovre', 'Høje-Taastrup',
  'Ishøj', 'Lyngby-Taarbæk', 'Rødovre', 'Vallensbæk', 'Århus', 'Favrskov', 'Norddjurs',
  'Odder', 'Randers', 'Silkeborg', 'Skanderborg', 'Syddjurs', 'Viborg', 'Aalborg',
  'Frederikshavn', 'Hjørring', 'Jammerbugt', 'Læsø', 'Mariagerfjord', 'Morsø',
  'Rebild', 'Thisted', 'Vesthimmerland', 'Brønderslev'
].map(kommune => ({ value: kommune, label: kommune }))
