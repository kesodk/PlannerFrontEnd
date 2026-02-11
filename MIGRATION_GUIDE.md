# Migration Guide: LocalStorage → API

Dette dokument beskriver ændringerne fra localStorage-baseret data til API integration.

## Hvad er ændret?

### Nye Filer
- `src/services/api.ts` - Core API service med authentication
- `src/services/studentApi.ts` - Student API hooks og data mappings
- `src/services/apiTestHelpers.ts` - Test utilities til API debugging
- `src/components/ApiStatusWidget.tsx` - Widget til API forbindelsesstatus
- `API_INTEGRATION.md` - Komplet API dokumentation

### Modificerede Filer
- `src/pages/Students.tsx` - Bruger nu TanStack Query hooks i stedet for localStorage
- `src/pages/Dashboard.tsx` - Tilføjet ApiStatusWidget
- `README.md` - Opdateret med API information

### Obsolete Filer (kan slettes hvis ønsket)
- `src/data/mockStudents.ts` - Bruges ikke længere
- `src/services/studentStorage.ts` - Bruges ikke længere

## Funktionelle Ændringer

### Students.tsx

**Før:**
```typescript
const [students, setStudents] = useState<Student[]>([])

useEffect(() => {
  const storedStudents = studentStorage.initializeWithMockData(initialMockStudents)
  setStudents(storedStudents)
}, [])

const handleDeleteStudent = (id: number) => {
  const updatedStudents = studentStorage.deleteStudent(id)
  setStudents(updatedStudents)
}
```

**Efter:**
```typescript
const { data: students = [], isLoading, isError, error, refetch } = useStudents()
const deleteStudent = useDeleteStudent()

const handleDeleteStudent = async (id: number) => {
  await deleteStudent.mutateAsync(id)
}
```

### Fordele ved ny approach
1. **Automatic Caching** - TanStack Query håndterer caching automatisk
2. **Loading States** - Built-in loading og error states
3. **Optimistic Updates** - Kan implementeres let med TanStack Query
4. **Real Data** - Data kommer nu fra API i stedet for mock data
5. **Centralized State** - Ingen manuel state management nødvendig

## Rollback Plan

Hvis API'et ikke virker endnu, kan du midlertidigt rollback:

1. **Gendan Students.tsx imports:**
```typescript
import { mockStudents as initialMockStudents } from '../data/mockStudents'
import { studentStorage } from '../services/studentStorage'
```

2. **Gendan useState og useEffect:**
```typescript
const [students, setStudents] = useState<Student[]>([])

useEffect(() => {
  const storedStudents = studentStorage.initializeWithMockData(initialMockStudents)
  setStudents(storedStudents)
}, [])
```

3. **Kommenter API hooks ud**

## Testing Checklist

- [ ] Dashboard åbner uden errors
- [ ] API Status Widget viser forbindelsesstatus
- [ ] Students siden loader (med spinner hvis data hentes)
- [ ] Kan se studerende hvis API returnerer data
- [ ] Error message vises hvis API fejler
- [ ] Refresh knap virker på Students siden
- [ ] Kan åbne Student Form modal
- [ ] Browser console viser eventuelle API fejl klart

## Næste Skridt

1. Test at API forbindelsen virker
2. Verificer at data mappings er korrekte
3. Opdater department/municipality ID mappings i `studentApi.ts`
4. Implementer Classes og Attendance API endpoints
5. Tilføj optimistic updates for bedre UX
6. Implementer error boundaries for bedre error handling
