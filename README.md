# Student Administration System

En moderne web-baseret løsning til administration af elever, fremmøderegistrering og holdoprettelse. Bygget med React, TypeScript og Mantine UI.

## 🚀 Tech Stack

- **Frontend Framework**: React 19 med TypeScript
- **Build Tool**: Vite 7
- **UI Library**: Mantine 8 (moderne, brugervenlig komponent-bibliotek)
- **Routing**: React Router v7
- **Data Management**: TanStack Query (React Query) til API-calls og caching
- **Forms**: React Hook Form med Zod validering
- **Data Tables**: AG Grid Community til kraftfulde tabeller
- **Testing**: Vitest + React Testing Library
- **Real-time**: Microsoft SignalR til live-opdateringer
- **Icons**: Tabler Icons

## 📦 Funktioner

### ✅ Implementeret
- **Dashboard**: Oversigt over nøgletal og aktiviteter
- **API Integration**: Forbindelse til test-API (cv-pc-x-server:1102)
- **Mock API**: JSON Server til lokal udvikling + in-memory fallback til production
- **API Status Widget**: Real-time forbindelsesstatus på dashboard
- **Elevadministration**: Hent, opret, opdater og slet elever via API
- **Holdadministration**: Oversigt over aktive og afsluttede hold
- **Fremmøderegistrering**: Daglig registrering af fremmøde med status-tracking
- **Responsiv design**: Virker på desktop, tablet og mobil
- **TanStack Query**: Smart caching og data management
- **Vercel-klar**: Automatisk fallback til in-memory mock data i production

### 🚧 Planlagt
- **Authentication UI**: Login/logout interface (API auth allerede implementeret)
- **Real-time updates**: Live notifikationer via SignalR
- **Excel export**: Export af fremmødedata og elevlister
- **Classes & Attendance API**: Integrere hold og fremmøde med API

## 🔌 API Integration

Projektet bruger nu API'et på `https://cv-pc-x-server:1102/api`.

**Se [API_INTEGRATION.md](./API_INTEGRATION.md) for komplet dokumentation.**

### Hurtig Start
1. Start development server: `npm run dev`
2. Dashboard viser API forbindelsesstatus
3. Students siden henter data fra API

### HTTPS Certificate
Første gang skal du accepte certificate warning i browseren ved at besøge API URL'en direkte.

## 🛠️ Udvikling

### Forudsætninger
- Node.js 18+ 
- npm eller yarn

### Installation og opstart

```bash
# Installer dependencies
npm install

# Start med MOCK API (anbefalet under udvikling)
npm run dev:mock

# Eller start kun Vite (hvis du vil bruge rigtig backend)
npm run dev

# Byg til produktion
npm run build

# Kør tests
npm run test

# Preview production build
npm run preview
```

**💡 Tip:** Brug `npm run dev:mock` under udvikling - det giver dig et fuldt funktionelt REST API med CRUD uden at være afhængig af backend.

**📖 Se [MOCK_API_GUIDE.md](./MOCK_API_GUIDE.md) for detaljer om mock API.**

### Project struktur
```
src/
├── components/          # Genbrugelige komponenter
│   ├── Navigation.tsx   # Sidebar navigation
│   └── Navigation.module.css
├── pages/              # Hovedsider
│   ├── Dashboard.tsx   # Dashboard med oversigt
│   ├── Students.tsx    # Elevadministration
│   ├── Classes.tsx     # Holdadministration  
│   └── Attendance.tsx  # Fremmøderegistrering
├── test/               # Test setup
│   └── setup.ts
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## 🔧 Konfiguration

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

## 📊 Næste skridt

1. **Backend Integration**: Connect til jeres C# API
2. **Authentication**: Implementer login med roller (admin, lærer, elev)
3. **SignalR Hub**: Real-time notifikationer og opdateringer
4. **Form Validation**: Udvidede validerings-regler med Zod
5. **State Management**: Hvis nødvendigt, tilføj Zustand for kompleks state
6. **Error Boundaries**: Fejlhåndtering og brugervenlige fejlmeddelelser
7. **Performance**: Code splitting og lazy loading af sider

## 🎨 Design System

Projektet bruger Mantine's design system med:
- Konsistent color palette
- Responsiv grid system
- Accessibility built-in
- Dark/light mode support (kan aktiveres)
- TypeScript support

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
