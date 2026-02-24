# Migration History

> **Note:** Dette dokument beskriver den historiske udvikling af projektet. Se [GETTING_STARTED.md](./GETTING_STARTED.md) for aktuel opsætning.

## Migration Timeline

### Phase 1: LocalStorage (Initial)
Projektet startede med localStorage til data persistence:
- Data gemmes i browser
- Simpel CRUD uden backend
- Mock data til udvikling

### Phase 2: External API (Midlertidig)
Forbindelse til eksternt API:
- `https://cv-pc-x-server:1102/api`
- CORS og certificate udfordringer
- Sat på pause grundet udviklingsforsinkelser

### Phase 3: Laravel Backend (Nuværende) ✅
Eget backend system:
- **Backend**: Laravel 12 + MySQL
- **Database**: XAMPP lokalt
- **Authentication**: Laravel Sanctum
- **API Resources**: Konsistent JSON formatting

---

## Arkitektur Ændringer

### Data Flow: Før vs. Nu

**Før (LocalStorage):**
```
User Interface → useState → localStorage → Browser Storage
```

**Før (External API):**
```
User Interface → TanStack Query → Fetch → External API
                                        ↓
                               CORS/Auth Issues
```

**Nu (Laravel):**
```
User Interface → TanStack Query → Fetch → Laravel API → MySQL Database
                      ↓                        ↓
                   Caching              Sanctum Auth
```

---

## Code Changes

### Students Management

**Gammel approach (localStorage):**
```typescript
const [students, setStudents] = useState<Student[]>([])

useEffect(() => {
  const stored = localStorage.getItem('students')
  if (stored) setStudents(JSON.parse(stored))
}, [])

const addStudent = (student: Student) => {
  const updated = [...students, student]
  setStudents(updated)
  localStorage.setItem('students', JSON.stringify(updated))
}
```

**Ny approach (TanStack Query + Laravel):**
```typescript
const { data: students = [], isLoading } = useStudents()
const createMutation = useCreateStudent()

const addStudent = async (student: Student) => {
  await createMutation.mutateAsync(student)
  // TanStack Query håndterer cache invalidering automatisk
}
```

### Fordele ved ny approach

1. **Automatic Caching** - TanStack Query cache management
2. **Loading States** - Built-in `isLoading`, `isError`
3. **Optimistic Updates** - UI opdateres før backend response
4. **Real Data Persistence** - MySQL database i stedet for browser
5. **Multi-user** - Delt data mellem brugere
6. **Authentication** - Sikker adgang med tokens
7. **Validation** - Backend validation med Laravel Form Requests

---

## Database Schema

Se [API_INTEGRATION.md](./API_INTEGRATION.md) for komplet database struktur.

**Core tables:**
- `students` - Elev information
- `classes` - Hold/klasser
- `class_student` - Many-to-many pivot table
- `users` - Authentication

---

## Breaking Changes

### API Response Format

Før (direkte array):
```json
[
  { "id": 1, "navn": "Anders" },
  { "id": 2, "navn": "Bent" }
]
```

Nu (samme format, men fra backend):
```json
[
  { "id": 1, "navn": "Anders" },
  { "id": 2, "navn": "Bent" }
]
```

> **Note**: Laravel Resources bruges til at matche samme format som mock data havde, så frontend koden skulle ikke ændres.

### Authentication

Før: Ingen authentication

Nu: Bearer token authentication
```typescript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
}
```

---

## Migration Steps (Historical)

Hvis du migrerer fra gammel version:

1. **Pull latest code** fra GitHub
2. **Install backend**:
   ```bash
   cd StudentAdminAPI
   composer install
   php artisan migrate --seed
   ```
3. **Update .env** med database credentials
4. **Start services**:
   - XAMPP (MySQL)
   - `php artisan serve`
   - `npm run dev` (frontend)
5. **Login** med admin credentials

---

## Deprecated Files

Følgende filer bruges ikke længere:

- ❌ `src/services/studentStorage.ts` - localStorage service
- ❌ `src/services/staticMockService.ts` - in-memory mock
- ❌ `src/config/apiConfig.ts` - API mode configuration
- ⚠️ `src/data/mockStudents.ts` - bruges kun til reference
- ⚠️ `src/data/mockClasses.ts` - bruges kun til modulperiode generation

**Kan slettes sikkert**: studentStorage.ts, staticMockService.ts, apiConfig.ts

---

## Se Også

- [GETTING_STARTED.md](./GETTING_STARTED.md) - Aktuel opsætning
- [API_INTEGRATION.md](./API_INTEGRATION.md) - API dokumentation
- [MODULPERIODER.md](./MODULPERIODER.md) - Modulperiode system

