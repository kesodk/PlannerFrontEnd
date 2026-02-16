/**
 * Modulperiode Utilities
 * 
 * Håndterer parsing, validering og beregning af modulperioder.
 * Format: ÅÅ-H-M# (f.eks. "26-1-M1")
 * - ÅÅ = År (2 cifre)
 * - H = Halvår (1=forår, 2=efterår)
 * - M# = Modulperiode nummer (M1, M2, M3)
 */

export interface ModulperiodeInfo {
  raw: string
  year: number
  half: 1 | 2
  module: 1 | 2 | 3
  isSpring: boolean
  isAutumn: boolean
  startDate: Date
  endDate: Date
  isPast: boolean
  isCurrent: boolean
  isFuture: boolean
}

/**
 * Parse modulperiode string til struktureret info
 */
export function parseModulperiode(modulperiode: string): ModulperiodeInfo {
  const [yearStr, halfStr, moduleStr] = modulperiode.split('-')
  
  const year = 2000 + parseInt(yearStr)
  const half = parseInt(halfStr) as 1 | 2
  const module = parseInt(moduleStr.replace('M', '')) as 1 | 2 | 3
  
  const isSpring = half === 1
  const isAutumn = half === 2
  
  const { startDate, endDate } = calculateModulperiodeDates(year, half, module)
  
  const now = new Date()
  now.setHours(0, 0, 0, 0) // Nulstil til start af dagen
  
  const isPast = endDate < now
  const isCurrent = startDate <= now && endDate >= now
  const isFuture = startDate > now
  
  return {
    raw: modulperiode,
    year,
    half,
    module,
    isSpring,
    isAutumn,
    startDate,
    endDate,
    isPast,
    isCurrent,
    isFuture
  }
}

/**
 * Beregn start- og slutdato for en modulperiode
 * Baseret på standard skolekalender
 */
function calculateModulperiodeDates(year: number, half: 1 | 2, module: 1 | 2 | 3): { startDate: Date; endDate: Date } {
  let startDate: Date
  let endDate: Date
  
  if (half === 2) {
    // Efterår (august - december + januar)
    switch (module) {
      case 1: // M1: Start august - slut september
        startDate = new Date(year, 7, 11) // 11. august
        endDate = new Date(year, 8, 22) // 22. september
        break
      case 2: // M2: Start oktober - midt november  
        startDate = new Date(year, 8, 22) // 22. september
        endDate = new Date(year, 10, 17) // 17. november
        break
      case 3: // M3: Midt november - januar (næste år)
        startDate = new Date(year, 10, 17) // 17. november
        endDate = new Date(year + 1, 0, 19) // 19. januar næste år
        break
    }
  } else {
    // Forår (januar - juni)
    switch (module) {
      case 1: // M1: Midt januar - start marts
        startDate = new Date(year, 0, 19) // 19. januar
        endDate = new Date(year, 2, 16) // 16. marts
        break
      case 2: // M2: Midt marts - start maj
        startDate = new Date(year, 2, 16) // 16. marts
        endDate = new Date(year, 4, 11) // 11. maj
        break
      case 3: // M3: Midt maj - juni
        startDate = new Date(year, 4, 11) // 11. maj
        endDate = new Date(year, 5, 30) // 30. juni
        break
    }
  }
  
  return { startDate, endDate }
}

/**
 * Tjek om en modulperiode er i fortiden (afsluttet)
 */
export function isModulperiodePast(modulperiode: string): boolean {
  const info = parseModulperiode(modulperiode)
  return info.isPast
}

/**
 * Tjek om en modulperiode er igangværende
 */
export function isModulperiodeCurrent(modulperiode: string): boolean {
  const info = parseModulperiode(modulperiode)
  return info.isCurrent
}

/**
 * Tjek om en modulperiode er fremtidig
 */
export function isModulperiodeFuture(modulperiode: string): boolean {
  const info = parseModulperiode(modulperiode)
  return info.isFuture
}

/**
 * Filtrer en liste af modulperioder til kun at inkludere fremtidige og nuværende
 */
export function filterValidModulperioder(modulperioder: string[]): string[] {
  return modulperioder.filter(mp => {
    const info = parseModulperiode(mp)
    return info.isCurrent || info.isFuture
  })
}

/**
 * Sorter modulperioder efter dato (nyeste først)
 */
export function sortModulperioder(modulperioder: string[], descending = true): string[] {
  return [...modulperioder].sort((a, b) => {
    const aInfo = parseModulperiode(a)
    const bInfo = parseModulperiode(b)
    
    const comparison = aInfo.startDate.getTime() - bInfo.startDate.getTime()
    return descending ? -comparison : comparison
  })
}

/**
 * Generer modulperioder for de næste X år
 */
export function generateModulperioder(yearsAhead = 2): string[] {
  const currentYear = new Date().getFullYear()
  const startYear = currentYear - 1 // Start fra sidste år
  const endYear = currentYear + yearsAhead
  
  const modulperioder: string[] = []
  
  for (let year = startYear; year <= endYear; year++) {
    const yearShort = year.toString().slice(-2)
    
    // Forår
    modulperioder.push(`${yearShort}-1-M1`)
    modulperioder.push(`${yearShort}-1-M2`)
    modulperioder.push(`${yearShort}-1-M3`)
    
    // Efterår
    modulperioder.push(`${yearShort}-2-M1`)
    modulperioder.push(`${yearShort}-2-M2`)
    modulperioder.push(`${yearShort}-2-M3`)
  }
  
  return modulperioder
}

/**
 * Get display navn for modulperiode
 */
export function getModulperiodeDisplayName(modulperiode: string): string {
  const info = parseModulperiode(modulperiode)
  const seasonName = info.isSpring ? 'Forår' : 'Efterår'
  const status = info.isPast ? '(Afsluttet)' : info.isCurrent ? '(Igangværende)' : '(Fremtidig)'
  
  return `${modulperiode} - ${seasonName} ${info.year}, Modul ${info.module} ${status}`
}

/**
 * Valider om en modulperiode kan bruges til at oprette nye hold
 */
export function canCreateClassForModulperiode(modulperiode: string): { valid: boolean; reason?: string } {
  const info = parseModulperiode(modulperiode)
  
  if (info.isPast) {
    return {
      valid: false,
      reason: `Modulperioden ${modulperiode} er afsluttet. Du kan ikke oprette hold for modulperioder i fortiden.`
    }
  }
  
  return { valid: true }
}
