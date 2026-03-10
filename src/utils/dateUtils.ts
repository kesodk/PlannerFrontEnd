/**
 * Formatter dato til dansk format med leading zeros
 * @param dateString - ISO dato string (YYYY-MM-DD eller ISO 8601)
 * @returns Formateret dato som DD.MM.YYYY
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    
    return `${day}.${month}.${year}`
  } catch {
    return '-'
  }
}

/**
 * Formatter dato til input format (YYYY-MM-DD)
 */
export function formatDateForInput(dateString: string | null | undefined): string {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch {
    return ''
  }
}

/**
 * Returnerer en timezone-sikker dato-string (YYYY-MM-DD) uden tidszone-offset.
 * Bruges til at sammenligne datoer uden at risikere off-by-one pga. UTC.
 */
export function toDateOnly(dateString: string): string {
  return dateString.slice(0, 10)
}

/**
 * ISO ugenummer (1-53) for en given dato.
 * Algoritme: ISO 8601 — uge starter mandag, uge 1 = uge med årets første torsdag.
 */
export function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/**
 * Returnerer true hvis datoen er en fredag i et LIGE ISO-ugenummer.
 * AspIT-elever har fri på disse dage (fri fredag hver 2. uge).
 */
export function isFreeFriday(date: Date): boolean {
  return date.getDay() === 5 && getISOWeek(date) % 2 === 0
}

/**
 * Returnerer true hvis datoen er en weekend (lørdag eller søndag).
 */
export function isWeekend(date: Date): boolean {
  const d = date.getDay()
  return d === 0 || d === 6
}

/**
 * Returnerer true hvis datoen er en skoledag
 * (ikke weekend og ikke fri fredag).
 */
export function isSchoolDay(date: Date): boolean {
  return !isWeekend(date) && !isFreeFriday(date)
}

/**
 * Returner YYYY-MM-DD for en Date.
 */
export function toISODateString(date: Date): string {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Beregn fremmødeprocent ud fra mødetid og gå-tid.
 * Standardtider: 08:45 → 15:00 (375 minutter).
 * @param modetid  "HH:MM"
 * @param gaTid    "HH:MM"
 * @param fraværendeHeleDagen  hvis true → 0%
 * @param overrideProcent  hvis sat → bruges direkte
 */
export function beregnFremmoedeProcent(
  modetid: string,
  gaTid: string,
  fraværendeHeleDagen: boolean,
  overrideProcent?: number | null,
): number {
  if (overrideProcent !== null && overrideProcent !== undefined) return overrideProcent
  if (fraværendeHeleDagen) return 0

  const TOTAL = 375 // 08:45 → 15:00
  const [mh, mm] = modetid.split(':').map(Number)
  const [gh, gm] = gaTid.split(':').map(Number)

  const startMin = Math.max(mh * 60 + mm, 8 * 60 + 45) // clamp til normal mødetid
  const slutMin  = Math.min(gh * 60 + gm, 15 * 60)      // clamp til normal sluttid
  const tilstedMin = Math.max(0, slutMin - startMin)

  return Math.round((tilstedMin / TOTAL) * 10000) / 100
}
