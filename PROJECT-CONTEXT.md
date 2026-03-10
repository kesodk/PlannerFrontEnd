# PROJECT CONTEXT — AspIT Planner
> Opdateret: 27. februar 2026
> Skriv her hvad der er vigtigt at vide inden næste session.

---

## STARTUP — Sådan startes projektet

```powershell
# 1. Start XAMPP (Apache + MySQL) via XAMPP Control Panel

# 2. Backend (Laravel) — kør i én terminal
cd "C:\Users\KESO\Desktop\KESO\_Personlige ting og projekter\StudentAdminAPI"
php artisan serve
# → http://localhost:8000

# 3. Frontend (Vite) — kør i en anden terminal
cd "C:\Users\KESO\Desktop\KESO\_Personlige ting og projekter\FrontEndTest"
npm run dev
# → http://localhost:5174
```

**Login:** admin@aspiring.dk / password123
**Auth:** Laravel Sanctum Bearer token, gemmes i localStorage under nøglen `auth_token`

---

## VIGTIG: VI BRUGER ÆGTE DATA — IKKE MOCK

Projektet brugte tidligere mock-data (JSON-filer i `/src/data/`). Det gør vi **ikke** længere.
Al data kommer nu fra Laravel backend på `http://localhost:8000/api`.
Mock-filerne i `/src/data/` eksisterer stadig men bruges ikke aktivt.
`staticMockService.ts` og `studentStorage.ts` i `/src/services/` er ligeledes forældet.

---

## DATABASEN — Vigtige feltnavne

**Students-tabellen bruger `naam` (ikke `name`, ikke `navn`, ikke `fornavn`/`efternavn`)**
- Feltet hedder `naam` — dette er et historisk valg og skal IKKE ændres
- TypeScript-interface i `planningApi.ts`: `PlanningStudent { id: number; naam: string }`
- Men i `studenter`-feltet på ugeplaner returnerer backend `navn` (se nedenfor)

**Forvirring om naam vs. navn:**
- `students`-tabellen: kolonnen hedder `naam`
- `PlanningController.php` loader `studenter:id,naam` og `formatUgeplan` mapper til `'naam' => $s->naam`
- `PlanningStudent` interface i frontend bruger `naam`
- Alle steder i Planning.tsx viser elevnavne via `s.naam`
- I `StudentRow` og `UgeplanCard` bruges `student.naam` / `s.naam`

---

## TECH STACK

### Frontend (`/FrontEndTest/src/`)
- React 19 + TypeScript
- Vite 7
- Mantine 8 (UI komponenter — brug Mantine overalt, ikke custom CSS)
- React Router v7
- TanStack Query (al data fetching, caching og invalidering)
- React Hook Form + Zod (formularer)

### Backend (`/StudentAdminAPI/`)
- Laravel 12, PHP 8.3+
- MySQL via XAMPP
- Laravel Sanctum (Bearer token auth)
- API Resources + manuelt formaterede responses

---

## IMPLEMENTERINGSSTATUS

### ✅ Fully implemented
- **Students CRUD** — `src/pages/Students.tsx` + `src/services/studentApi.ts`
- **Classes CRUD** — `src/pages/Classes.tsx` + `src/services/classApi.ts`
  - Modulperiode-validering er implementeret
  - Status-beregning (Aktiv/Afsluttet/Kommende) er timezone-safe via `toDateOnly()` i `dateUtils.ts`
  - "Opdater"-knap til at refreshe data
- **Student enrollment/unenrollment på hold** — fungerer
- **Fremmøde (Attendance)** — `src/pages/Attendance.tsx` + `src/services/attendanceApi.ts`
  - Tabel: `attendance_records` (migration: `2026_03_07_100000_create_attendance_records_table.php`)
  - Model: `StudentAdminAPI/app/Models/Attendance.php`
  - Controller: `AttendanceController.php` (5 endpoints: byDate, byMonth, studentStats, upsert, destroy)
  - Fri fredag regel: elever har fri på fredage i **lige** ISO-ugenumre
  - `override_procent`: lærer kan tilsidesætte automatisk beregning (standardtider 08:45→15:00 = 375 min)
  - Frontend utils: `isFreeFriday()`, `isSchoolDay()`, `beregnFremmoedeProcent()` i `dateUtils.ts`
- **Login/Auth** — `src/pages/LoginPage.tsx` + `src/contexts/AuthContext.tsx`
- **Planlægning (Planning-siden)** — se eget afsnit nedenfor

### ⏳ Ikke implementeret endnu
- Evaluations

---

## PLANNING-SIDEN — Detaljeret overblik

**Filer:**
- Frontend: `src/pages/Planning.tsx`
- API hooks: `src/services/planningApi.ts`
- Backend controller: `StudentAdminAPI/app/Http/Controllers/Api/PlanningController.php`

### Koncepter
- **Ugeplan**: En plan for et bestemt hold, en bestemt uge. Har 5 dage (man-fre) med felterne formål, læringsmål, indhold, materialer.
- **Kladde** (`er_kladde: true`): En ugeplan-skabelon der IKKE er låst til en uge — bruges på tværs af uger. Oprettes via "Dupliker til kladde".
- **Differentiering**: Elever kan tilknyttes specifikke ugeplaner, så man kan lave differentierede planer for undergrupper.

### TanStack Query — To separate caches
```
['planning', 'ugeplaner', classId]  → Ugeplaner for valgt uge (er_kladde=0)
['planning', 'kladder', classId]    → Kladder for holdet (er_kladde=1, ingen uge-filter)
['planning', 'pinned']              → Holds som lærer følger
['planning', 'classes']             → Alle hold (til søgning)
```
Når man muterer (opret/opdater/slet/sync elever) skal **begge** query keys invalideres.

### Vigtige hooks i `planningApi.ts`
- `useUgeplaner(classId, uge, aar)` — fetcher `?er_kladde=0`
- `useKladder(classId)` — fetcher `?er_kladde=1`, ingen uge-filter
- `useCreateUgeplan` — invaliderer begge caches
- `useUpdateUgeplan` — invaliderer begge caches
- `useDeleteUgeplan` — invaliderer begge caches
- `useSyncStudents` — invaliderer begge caches, bruger `variables.classId` (IKKE `u.class_id` fra response, da type kan afvige)

### UI-layout
```
[VENSTRE KOLONNE]          [MIDTERKOLONNE]           [HØJRE KOLONNE]
Hold jeg følger            Tabs: Indhold | Diff.      Uge-navigation
  (scroll)                   Indhold-tab:               Gem-knap
Elever på holdet             - Plante-tabel             Dupliker til kladde (kun Indhold-tab)
  (scroll)                   - Tomtext + ingen plan     UGENS UGEPLANER
                             Differentiering-tab:         + Opret ugeplan
                             - To kolonner:               [liste af ugeplaner]
                               Uden plan | I planen     KLADDER PÅ HOLDET
                               med pile-knapper           [liste af kladder]
```

### Vigtige logik-detaljer
- **Elevliste på Differentiering**: "Elever uden ugeplan" = elever der IKKE er i NOGEN ugeplan denne uge (ikke kun den valgte). `allAssignedIds` bruges til dette.
- **Kladde auto-navn**: `Kladde af ${week} ${year} ${kladder.length + 1}`
- **Ugeplan auto-navn**: `${week} ${year} ${ugeplaner.length + 1}`
- **Ingen modal** for oprettelse — navne auto-genereres
- **handleDuplicateToKladde**: Kopierer kun `editedDage` (tabelindhold), IKKE elever

### Backend — PlanningController endpoints
```
GET    /api/planning/classes              → Alle hold (til søgning)
GET    /api/planning/pinned?teacher_id=  → Pinned holds til lærer
POST   /api/planning/pin                 → Pin hold
DELETE /api/planning/pin                 → Unpin hold
GET    /api/planning/ugeplaner?class_id=&uge=&aar=&er_kladde= → Ugeplaner
POST   /api/planning/ugeplaner           → Opret ugeplan
PUT    /api/planning/ugeplaner/{id}      → Opdater ugeplan (dage + navn)
DELETE /api/planning/ugeplaner/{id}      → Slet ugeplan
POST   /api/planning/ugeplaner/{id}/students → Sync elever (fuld replace)
```

**syncStudents validering:** Bruger `'present|array'` (IKKE `'required|array'`) så tomme arrays accepteres når man fjerner den sidste elev.

---

## KENDTE QUIRKS OG FIXES

1. **`naam` vs `naam`**: Studenter-tabellen bruger `naam`. Alt i Planning-konteksten skal bruge dette. Dobbelttjek altid ved nye backend-endpoints.

2. **Cache-invalidering**: Brug altid `variables.classId` i `onSuccess` callbacks (ikke response-data `u.class_id`) for at sikre korrekt query key type.

3. **Modulperiode-datoer**: Brug altid `parseModulperiode()` fra `modulperiodeUtils.ts` og `toDateOnly()` fra `dateUtils.ts` for timezone-sikker datosammenligning.

4. **Backend kræver `naam` i eager loading**: `with(['dage', 'studenter:id,naam'])` i alle Ugeplan-queries.

5. **`formatUgeplan` i PlanningController** mapper studenter med nøglen `naam` — frontend forventer samme.

---

## FILSTRUKTUR — Nøglefiler

```
src/
  pages/
    Planning.tsx        ← Planlægningssiden (kompleks, se ovenfor)
    Classes.tsx         ← Hold-administration
    Students.tsx        ← Elev-administration
    Dashboard.tsx       ← Startside
  services/
    planningApi.ts      ← Alle hooks til Planning (TanStack Query)
    classApi.ts         ← Hooks til hold
    studentApi.ts       ← Hooks til elever
    api.ts              ← Base apiFetch helper + auth
  contexts/
    AuthContext.tsx     ← Login-state, Sanctum token
    ThemeContext.tsx    ← Lys/mørk tilstand
  utils/
    modulperiodeUtils.ts ← parseModulperiode(), getModulperiodeDates()
    dateUtils.ts         ← toDateOnly() for timezone-sikker dato-håndtering
  schemas/
    studentSchema.ts    ← Zod-validering til elev-formularer

StudentAdminAPI/
  app/Http/Controllers/Api/
    PlanningController.php  ← Al planning-logik
    StudentController.php
    ClassController.php
  app/Models/
    Ugeplan.php
    UgeplanDag.php
    Student.php (feltet hedder naam)
    ClassModel.php
```

---

## NÆSTE SKRIDT (ikke implementeret)

- **Fremmøde-registrering** (Attendance.tsx er en stub)
- Overvej at tilføje **notifikationer** (Mantine notifications er allerede installeret og bruges i Classes.tsx)
