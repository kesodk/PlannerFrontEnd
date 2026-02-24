# Student Administration System

En moderne web-baseret løsning til administration af elever, fremmøderegistrering og holdoprettelse. Bygget med React, TypeScript, Mantine UI og Laravel backend.

## 🚀 Tech Stack

### Frontend
- **Framework**: React 19 med TypeScript
- **Build Tool**: Vite 7
- **UI Library**: Mantine 8 (moderne, brugervenlig komponent-bibliotek)
- **Routing**: React Router v7
- **Data Management**: TanStack Query (React Query) til API-calls og caching
- **Forms**: React Hook Form med Zod validering
- **Data Tables**: AG Grid Community til kraftfulde tabeller
- **Testing**: Vitest + React Testing Library
- **Icons**: Tabler Icons

### Backend
- **Framework**: Laravel 12
- **Database**: MySQL via XAMPP
- **Authentication**: Laravel Sanctum (Bearer token)
- **API Resources**: ClassResource, StudentResource for consistent formatting

## 📦 Funktioner

### ✅ Implementeret
- **Dashboard**: Oversigt over nøgletal og aktiviteter
- **Authentication**: Login/logout med Laravel Sanctum
- **Elevadministration**: Komplet CRUD via Laravel API
  - Opret, rediger, slet elever
  - Detaljeret elev information med CPR, adresse, forældre info
  - Support for afdelinger (Trekanten, Østjylland, Sønderjylland, Storkøbenhavn)
- **Holdadministration**: Komplet CRUD med modulperiode system
  - Opret, rediger, slet hold
  - Tilføj/fjern elever fra hold
  - Modulperiode validering (kan ikke oprette hold for tidligere perioder)
  - Beskyttelse af afsluttede hold (read-only når modulperiode er udløbet)
  - Status tracking (Igangværende, Fremtidig, Afsluttet)
- **Modulperiode System**: AspIT skolekalender integration
  - Format: ÅÅ-H-M# (f.eks. "26-1-M1" = Forår 2026, Modul 1)
  - 2 halvår per år, 3 modulperioder per halvår (6-7 uger hver)
  - Automatisk beregning af start/slut datoer
- **Responsiv design**: Virker på desktop, tablet og mobil
- **TanStack Query**: Smart caching og data management

### 🚧 Planlagt
- **Fremmøderegistrering**: Daglig registrering af fremmøde
- **Evaluations**: Formativ og summativ evaluering
- **Teachers Administration**: CRUD for lærere
- **Excel export**: Export af fremmødedata og elevlister

## 🚀 Kom i Gang

**Se [GETTING_STARTED.md](./GETTING_STARTED.md) for komplet opstart guide.**

### Hurtig Start

1. **Start XAMPP** (Apache + MySQL)
2. **Start Backend API**:
   ```powershell
   cd StudentAdminAPI
   php artisan serve
   ```
3. **Start Frontend**:
   ```powershell
   cd FrontEndTest
   npm run dev
   ```
4. **Log ind** på http://localhost:5174 med:
   - Email: `admin@aspiring.dk`
   - Password: `password123`

## 🛠️ Udvikling

### Forudsætninger
- Node.js 18+
- PHP 8.3+
- Composer
- XAMPP (Apache + MySQL)

### Installation

```bash
# Installer frontend dependencies
npm install

# Start development server
npm run dev

# Byg til produktion
npm run build

# Kør tests
npm run test

# Preview production build
npm run preview
```

### Project struktur
```
src/
├── components/          # Genbrugelige komponenter
│   ├── Navigation.tsx   # Sidebar navigation
│   ├── StudentForm.tsx  # Form til opret/rediger elev
│   ├── StudentViewModal.tsx # Modal til visning af elev detaljer
│   ├── ThemeToggle.tsx  # Dark/light mode toggle
│   └── Navigation.module.css
├── contexts/           # React contexts
│   ├── SidebarContext.tsx  # Sidebar state management
│   └── ThemeContext.tsx    # Theme state
├── pages/              # Hovedsider
│   ├── Dashboard.tsx   # Dashboard med oversigt
│   ├── Students.tsx    # Elevadministration (CRUD)
│   ├── Classes.tsx     # Holdadministration (CRUD + enrollment)
│   └── Attendance.tsx  # Fremmøderegistrering (not implemented)
├── services/           # API services
│   ├── api.ts          # Core API service med auth
│   ├── studentApi.ts   # Student endpoints og hooks
│   └── classApi.ts     # Class endpoints og hooks
├── utils/              # Utility functions
│   ├── dateUtils.ts    # Date formatting helpers
│   └── modulperiodeUtils.ts # Modulperiode parsing og validering
├── schemas/            # Zod validation schemas
│   └── studentSchema.ts
├── types/              # TypeScript types
│   └── Student.ts
├── data/               # Static/mock data (legacy)
│   └── mockClasses.ts  # Modulperiode generation
├── test/               # Test setup
│   └── setup.ts
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## 📚 Dokumentation

- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Hvordan du starter systemet
- **[MODULPERIODER.md](./MODULPERIODER.md)** - Forklaring af modulperiode systemet
- **[API_INTEGRATION.md](./API_INTEGRATION.md)** - API dokumentation og endpoints
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Løsninger på almindelige problemer
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guide til deployment

## 🔧 Konfiguration

### API Configuration
API URL konfigureres i `src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8000/api'
```

### PostCSS (Mantine styling)
Projektet bruger PostCSS med Mantine preset for optimal styling. Konfiguration findes i `postcss.config.cjs`.

### Vite Configuration
- TypeScript support
- React plugin
- Vitest integration for testing
- PostCSS processing

## 🧪 Testing

Projektet er sat op med:
- **Vitest** som test runner
- **React Testing Library** til component testing  
- **jsdom** som browser environment
- **@testing-library/jest-dom** til extended matchers

```bash
# Kør alle tests
npm run test

# Kør tests med UI
npm run test:ui
```

## 🔐 Authentication

Systemet bruger Laravel Sanctum til authentication:
- Login returnerer en bearer token
- Token gemmes i localStorage
- Alle API requests inkluderer token i Authorization header
- Token invalideres ved logout

### Test Credentials
- Email: `admin@aspiring.dk`
- Password: `password123`

## 📊 Modulperiode System

AspIT's skolekalender er implementeret med følgende struktur:

- **Format**: `ÅÅ-H-M#` (f.eks. "26-1-M1")
  - ÅÅ = År (2-cifret)
  - H = Halvår (1=Forår, 2=Efterår)
  - M# = Modulperiode nummer (1, 2, eller 3)

- **Validering**:
  - Kan ikke oprette hold for tidligere modulperioder
  - Afsluttede hold er read-only
  - Automatisk status beregning (Fremtidig, Igangværende, Afsluttet)

Se [MODULPERIODER.md](./MODULPERIODER.md) for komplet dokumentation.

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 🤝 Bidrag

Dette er et internt projekt for AspIT. Kontakt udviklingsteamet for spørgsmål.
