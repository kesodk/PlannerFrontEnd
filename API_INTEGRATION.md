# API Integration Guide

## Oversigt

Projektet er nu integreret med test-API'et på `https://cv-pc-x-server:1102/api`.

## 🚀 Quick Start

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Se API status** på Dashboard - der er nu en "API Forbindelse" widget

3. **Test student data** ved at gå til Students siden

### HTTPS Certificate Warning

Første gang du tilgår API'et, skal du muligvis acceptere certificate warning:
1. Åbn `https://cv-pc-x-server:1102/api/auth/login` i browseren
2. Accepter security warning (klik "Advanced" → "Proceed")
3. Reload applikationen

## Arkitektur

### API Services
- **`src/services/api.ts`** - Core API service med authentication og fetch funktionalitet
- **`src/services/studentApi.ts`** - Student-specifikke API hooks og mappings

### Authentication

API'et bruger token-baseret authentication. Ved første kald til API'et:
1. Login sker automatisk med credentials
2. Token gemmes i localStorage under nøglen `auth_token`
3. Token sendes med alle efterfølgende requests som Bearer token
4. Ved 401 unauthorized, forsøges automatisk re-authentication

### Data Mapping

API'ets `StudentDTO` bliver automatisk mappet til vores interne `Student` type:

**API → App Mapping:**
- `studentId` → `id`
- `name` → `navn`
- `birthdate` → `fødselsdato`
- `serialNumber` → `cpr`
- `privatePhone` → `telefonnr`
- `privateEmail` → `email`
- `departmentId` → `afdeling` (via lookup)
- `municipalityId` → `kommune` (via lookup)
- `funding` ('STU'/'LAB'/'13U') → `lovgrundlag` (13U maps til 'Privat')
- `status` ('indskrevet'/'UP/Afklaring') → `status`

### TanStack Query Hooks

Følgende hooks er tilgængelige i `studentApi.ts`:

```typescript
// Hent alle studerende
const { data, isLoading, error } = useStudents()

// Hent enkelt studerende
const { data } = useStudent(studentId)

// Opret studerende
const createStudent = useCreateStudent()
await createStudent.mutateAsync(newStudent)

// Opdater studerende
const updateStudent = useUpdateStudent()
await updateStudent.mutateAsync(updatedStudent)

// Slet studerende
const deleteStudent = useDeleteStudent()
await deleteStudent.mutateAsync(studentId)
```

## Konfiguration

### Department & Municipality Mapping

Lige nu bruges simple ID-til-navn mappings i `studentApi.ts`. Disse skal muligvis tilpasses:

```typescript
// mapDepartmentIdToAfdeling - mapper department ID til afdeling
// mapAfdelingToDepartmentId - mapper afdeling til department ID
// mapMunicipalityIdToKommune - mapper municipality ID til kommune navn
// mapKommuneToMunicipalityId - mapper kommune navn til municipality ID
```

Opdater disse funktioner når du får det korrekte mapping fra API'et.

## HTTPS & Certificate Issues

Da API'et kører på `https://cv-pc-x-server:1102`, kan der være certificate problemer under development:

### Browser
- Besøg API URL'en direkte i browseren først
- Accepter certificate warnings
- Derefter vil API calls virke

### Development
Hvis der er CORS eller certificate problemer, kan du:
1. Konfigurere en proxy i `vite.config.ts`
2. Eller arbejde direkte med backend team om CORS headers

## Migration fra Mock Data

Den gamle localStorage-baserede approach i `studentStorage.ts` er stadig tilgængelig, men bruges ikke længere i `Students.tsx`. Du kan:
- Slette `src/data/mockStudents.ts` hvis ikke længere nødvendig
- Beholde `studentStorage.ts` som backup/fallback

## Næste Skridt

1. **Test API forbindelsen** - Kør projektet og se om authentication virker
2. **Opdater mappings** - Tilpas department/municipality mappings til korrekte værdier
3. **Tilføj endpoint til Classes & Attendance** - Udvid `api.ts` med flere endpoints
4. **Error handling** - Forbedre error messages og fallback UI

## Debugging

For at debugge API calls:
- Åbn browser DevTools → Network tab
- Se TanStack Query DevTools (nederst i venstre hjørne når app kører)
- Check console for authentication/API errors
