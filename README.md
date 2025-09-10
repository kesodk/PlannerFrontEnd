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
- **Elevadministration**: Liste over alle elever med søgning og filtrering
- **Holdadministration**: Oversigt over aktive og afsluttede hold
- **Fremmøderegistrering**: Daglig registrering af fremmøde med status-tracking
- **Responsiv design**: Virker på desktop, tablet og mobil

### 🚧 Planlagt (til integration med C# backend)
- **Authentication**: Login/logout med roller
- **API Integration**: Connection til jeres C# backend
- **Real-time updates**: Live notifikationer via SignalR
- **Data persistence**: Gem/hent data fra database
- **Excel export**: Export af fremmødedata og elevlister
- **Avancerede formularer**: Oprettelse og redigering af elever/hold

## 🛠️ Udvikling

### Forudsætninger
- Node.js 18+ 
- npm eller yarn

### Installation og opstart
```bash
# Installer dependencies
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

## 📊 Neste skridt

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

## 🤝 Bidrag til projektet

1. Opret en feature branch
2. Implementer funktionaliteten
3. Tilføj tests for ny funktionalitet  
4. Tjek at build og tests virker
5. Opret pull request

## 📞 Support

For spørgsmål eller hjælp til videreudvikling, kontakt frontend-teamet.
