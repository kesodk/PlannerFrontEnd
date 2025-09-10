import { z } from 'zod'

// Helper schema for CPR validation
const cprSchema = z.string()
  .regex(/^\d{6}-?\d{4}$/, 'CPR skal være i format DDMMYY-XXXX eller DDMMYYXXXX')
  .transform(val => val.replace('-', ''))

// Helper schema for email validation
const emailSchema = z.string().email('Ugyldig email adresse').or(z.literal(''))

// Helper schema for phone validation
const phoneSchema = z.string()
  .regex(/^[\d\s\+\-\(\)]{8,}$/, 'Telefonnummer skal være mindst 8 cifre')
  .or(z.literal(''))

export const studentSchema = z.object({
  // Elevoplysninger
  navn: z.string().min(2, 'Navn skal være mindst 2 tegn'),
  fødselsdato: z.string().min(1, 'Fødselsdato er påkrævet'),
  cpr: cprSchema.optional().or(z.literal('')),
  adresse: z.string().min(1, 'Adresse er påkrævet'),
  telefonnr: phoneSchema.optional(),
  email: emailSchema.optional(),
  forældreNavn: z.string().optional().or(z.literal('')),
  forældreTelefon: phoneSchema.optional(),
  forældreAdresse: z.string().optional().or(z.literal('')),
  forældreEmail: emailSchema.optional(),
  
  // Uddannelse
  afdeling: z.enum(['Trekanten', 'Østjylland', 'Sønderjylland', 'Storkøbenhavn']),
  kursistnr: z.string().optional().or(z.literal('')),
  kommune: z.string().min(1, 'Kommune er påkrævet'),
  lovgrundlag: z.enum(['STU', 'LAB', 'Privat', 'Andet']),
  vejlederNavn: z.string().optional().or(z.literal('')),
  vejlederTlf: phoneSchema.optional(),
  vejlederEmail: emailSchema.optional(),
  startdato: z.string().min(1, 'Startdato er påkrævet'),
  slutdato: z.string().optional().or(z.literal('')),
  spor: z.enum(['AspIT', 'AspIN']),
  status: z.enum(['UP/Afklaring', 'Indskrevet']),
})

export type StudentFormData = z.infer<typeof studentSchema>
