# Modulperiode System - AspIT

> **Implementeringsstatus:** ✅ Fuldt implementeret med database-backend (marts 2026)

---

## NY IMPLEMENTERING (marts 2026) — Database-styrede modulperioder

### Oversigt
Modulperioder administreres nu via en dedikeret admin-side og gemmes i databasen med præcise start- og slutdatoer. Det manuelle beregningssystem bruges ikke længere til aktive modulperioder.

### Admin-side
Ruten: `/administration/modulperioder` (tilgængelig under Administration → Modulperioder i navigationen)

Funktioner:
- **Opret** nye modulperioder (kun fremtidige — startdato skal være efter dags dato)
- **Rediger** eksisterende (kun fremtidige modulperioder kan redigeres)
- **Slet** eksisterende (kun fremtidige modulperioder kan slettes)
- Igangværende og afsluttede modulperioder er **låste**

### Regler (business logic)
| Status | Oprette | Redigere | Slette |
|--------|---------|----------|--------|
| Fremtidig | ✅ | ✅ | ✅ |
| Igangværende | — | ❌ | ❌ |
| Afsluttet | — | ❌ | ❌ |

**Oprettelse via UI:** Startdato skal ligge i fremtiden (kun valideret i frontend — backend tillader historiske datoer, så administratorer kan indsætte ældre modulperioder direkte via seeder/API).

### Database — `modulperioder`-tabellen
```sql
CREATE TABLE modulperioder (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  kode       VARCHAR(20) UNIQUE NOT NULL,  -- f.eks. "26-1-M1"
  startdato  DATE NOT NULL,
  slutdato   DATE NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Seeder
- **Fil:** `database/seeders/ModulperiodeSeeder.php`
- Kør med: `php artisan db:seed --class=ModulperiodeSeeder` (bruger `insertOrIgnore` — kan køres igen uden fejl)

### Præ-seedede modulperioder (fra AspIT kalender)

| Kode | Startdato | Slutdato |
|------|-----------|----------|
| 25-1-M1 | 2025-01-20 | 2025-03-16 |
| 25-1-M2 | 2025-03-17 | 2025-05-11 |
| 25-1-M3 | 2025-05-12 | 2025-06-27 |
| 25-2-M1 | 2025-08-11 | 2025-09-21 |
| 25-2-M2 | 2025-09-22 | 2025-11-16 |
| 25-2-M3 | 2025-11-17 | 2026-01-18 |
| 26-1-M1 | 2026-01-19 | 2026-03-15 |
| 26-1-M2 | 2026-03-16 | 2026-05-10 |
| 26-1-M3 | 2026-05-11 | 2026-06-26 |
| 26-2-M1 | 2026-08-10 | 2026-09-20 |
| 26-2-M2 | 2026-09-21 | 2026-11-15 |
| 26-2-M3 | 2026-11-16 | 2027-01-17 |
| 27-1-M1 | 2027-01-18 | 2027-03-14 |
| 27-1-M2 | 2027-03-15 | 2027-05-09 |
| 27-1-M3 | 2027-05-10 | 2027-06-25 |
| 27-2-M1 | 2027-08-09 | 2027-09-19 |
| 27-2-M2 | 2027-09-20 | 2027-11-14 |
| 27-2-M3 | 2027-11-15 | 2028-01-17 |

Slutdatoer for M1/M2 = dagen før næste periode starter (søndag).
Slutdatoer for efterårets M3 = dagen før næste forårs M1 starter.
Forår-afslutningsdatoer = SOMMERAFSLUTNING fra AspIT kalender.

### Backend
- **Migration:** `2026_03_07_000001_create_modulperioder_table.php`
- **Model:** `app/Models/Modulperiode.php`
  - Computed attribute `status` → `'Fremtidig' | 'Igangværende' | 'Afsluttet'`
  - Metoder: `isFuture()`, `isPast()`, `isCurrent()`
- **Controller:** `app/Http/Controllers/Api/ModulperiodeController.php`
- **Routes:** (auth:sanctum)
  ```
  GET    /api/modulperioder          → Liste alle
  POST   /api/modulperioder          → Opret (validates startdato > today)
  PUT    /api/modulperioder/{id}     → Rediger (403 hvis ikke fremtidig)
  DELETE /api/modulperioder/{id}     → Slet (403 hvis ikke fremtidig)
  ```

### Frontend
- **Service:** `src/services/modulperiodeApi.ts` — TanStack Query hooks:
  - `useModulperioder()` — henter alle
  - `useCreateModulperiode()`
  - `useUpdateModulperiode()`
  - `useDeleteModulperiode()`
- **Side:** `src/pages/Modulperioder.tsx`

### Integration med Hold (Classes.tsx)
`Classes.tsx` henter nu modulperioder fra API'et via `useModulperioder()`.
- Dropdown til valg af modulperiode ved oprettelse/redigering af hold viser kun **igangværende og fremtidige** modulperioder.
- Datoerne for holdet (startdato/slutdato) hentes direkte fra den valgte modulperiodes DB-data — ikke beregnet.

---

## HISTORISK IMPLEMENTERING (automatisk beregning)

Det følgende beskriver det **gamle** system som nu er udfaset for nye modulperioder. Koden i `modulperiodeUtils.ts` eksisterer stadig men bruges kun som fallback/reference.



AspIT opdeler skoleåret i **2 halvår**, hver med **3 modulperioder**. Hver modulperiode er cirka 6-7 uger og tilpasses efter skoleferier og helligdage.

## Navngivningskonvention

Modulperioder følger formatet: `ÅÅ-H-M#`

- **ÅÅ** = Årstal (2 cifre) - f.eks. `25` for 2025, `26` for 2026
- **H** = Halvår:
  - `1` = Forår (januar - juni)
  - `2` = Efterår (juli - december)
- **M#** = Modulperiode nummer:
  - `M1` = Modulperiode 1 (blå periode)
  - `M2` = Modulperiode 2 (gul periode)
  - `M3` = Modulperiode 3 (grøn periode)

### Eksempler:
- `25-2-M1` = Efterår 2025, Modulperiode 1
- `26-1-M2` = Forår 2026, Modulperiode 2
- `26-2-M3` = Efterår 2026, Modulperiode 3

## Struktur og Tidspunkter

### Efterår (Juli - December)
**Halvår: 2**

| Modul | Farve | Periode | Uger | Eksempel (2025) |
|-------|-------|---------|------|-----------------|
| M1 | Blå | Start august - slut september | 6-7 uger | 11. august - 22. september |
| M2 | Gul | Start oktober - midt november | 6-7 uger | 22. september - 17. november |
| M3 | Grøn | Midt november - januar (næste år) | 6-7 uger | 17. november - januar |

**Note:** M3 i efteråret strækker sig ind i det næste års januar måned.

### Forår (Januar - Juni)
**Halvår: 1**

| Modul | Farve | Periode                   | Uger     | Eksempel (2026)       |
|-------|-------|---------------------------|----------|-----------------------|
| M1    | Blå   | Midt januar - start marts | 6-7 uger | 19. januar - 6. marts |
| M2    | Gul   | Midt marts - start maj    | 6-7 uger | 16. marts - 8. maj    |
| M3    | Grøn  | Midt maj - juni           | 6-7 uger | 11. maj - juni        |

## Konkrete Eksempler fra Kalender

### Efterår 2025 (25-2)
```
25-2-M1: 11. august 2025 → 22. september 2025
25-2-M2: 22. september 2025 → 17. november 2025
25-2-M3: 17. november 2025 → januar 2026
```

### Forår 2026 (26-1)
```
26-1-M1: 19. januar 2026 → 6. marts 2026
26-1-M2: 16. marts 2026 → 8. maj 2026
26-1-M3: 11. maj 2026 → juni 2026
```

## Overlap og Særlige Forhold

1. **Modulperiode 3 overlap**: Den sidste modulperiode i efteråret strækker sig ind i det næste års januar, hvilket betyder den overlapper med starten af det nye kalenderår.

2. **Ferieplanlægning**: Modulperiodernes nøjagtige start- og slutdatoer tilpasses:
   - Professionslæring uger
   - Eksamensperioder
   - Efterårsferie, juleferie, vinterferie, påskeferie, etc.
   - Helligdage og skolefridage

3. **Undervisningsdage**: Hver modulperiode har typisk 15-22 undervisningsdage afhængigt af ferier.

## Teknisk Implementation

### Datoberegning
For at beregne start- og slutdato for en modulperiode:

```typescript
// Format: ÅÅ-H-M#
// Eksempel: "26-1-M1"
const [year, half, module] = modulperiode.split('-')
const fullYear = 2000 + parseInt(year)
const isSpring = half === '1'
const moduleNum = parseInt(module.replace('M', ''))
```

### Validering
- En modulperiode er **i fortiden** hvis slutdatoen er før dags dato
- En modulperiode er **igangværende** hvis startdato ≤ i dag ≤ slutdato
- En modulperiode er **fremtidig** hvis startdatoen er efter dags dato

### Hold Status
Hold får automatisk status baseret på deres modulperiodes tidspunkt:
- **Fremtidig**: Startdato er efter i dag
- **Igangværende**: I dag er mellem start- og slutdato
- **Afsluttet**: Slutdato er før i dag

## Business Rules

1. **Oprettelse af hold**: Man må IKKE oprette et hold med en modulperiode der er i fortiden
2. **Redigering af hold**: Afsluttede hold (hvor modulperioden er forbi) må ikke redigeres
3. **Elev-tilmelding**: Elever kan kun tilmeldes hold hvis modulperioden ikke er afsluttet
4. **One-to-one mapping**: Én elev kan kun være tilmeldt ét hold per modulperiode

## Fremtidige Modulperioder (Eksempler)

```
Efterår 2026:
26-2-M1: August 2026
26-2-M2: Oktober 2026
26-2-M3: November 2026 - Januar 2027

Forår 2027:
27-1-M1: Januar 2027
27-1-M2: Marts 2027
27-1-M3: Maj 2027
```

## Typiske Use Cases

1. **Planlægge næste semester**: Lærere opretter hold for den kommende modulperiode
2. **Se aktuelle hold**: Filtrere på igangværende modulperiode(r)
3. **Historik**: Se tidligere hold ved at filtrere på afsluttede modulperioder
4. **Elevfordeling**: Sikre at elever ikke er booket på flere hold samtidig i samme modulperiode
