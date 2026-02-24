<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Student Administration System

Dette er en moderne React TypeScript frontend til administration af elever, hold og fremmøderegistrering.
Backend er Laravel 12 API med MySQL database.

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite 7 som build tool
- Mantine 8 UI bibliotek
- React Router v7 til navigation
- TanStack Query til data management og caching
- React Hook Form + Zod til formulare validation
- AG Grid Community til tabeller (ikke brugt endnu)
- Vitest + React Testing Library til testing

### Backend
- Laravel 12 (PHP 8.3+)
- MySQL via XAMPP
- Laravel Sanctum authentication (Bearer token)
- API Resources for consistent JSON formatting

## Udviklings Guidelines
- Brug Mantine komponenter hvor muligt
- Følg React Hook patterns
- Implementer proper TypeScript typing
- Tilføj tests for nye funktioner
- Brug TanStack Query til API calls
- Follow responsive design principper
- Modulperiode format: ÅÅ-H-M# (e.g., "26-1-M1")

## Projektstruktur
- `/src/components/` - Genbrugelige komponenter (Navigation, Forms, Modals)
- `/src/pages/` - Hovedsider (Dashboard, Students, Classes, Attendance)
- `/src/services/` - API services (api.ts, studentApi.ts, classApi.ts)
- `/src/utils/` - Utility functions (dateUtils, modulperiodeUtils)
- `/src/types/` - TypeScript type definitions
- `/src/schemas/` - Zod validation schemas
- `/src/test/` - Test setup og utilities

## API Integration
- Backend API: http://localhost:8000/api
- Authentication: Laravel Sanctum Bearer token
- All API calls use TanStack Query hooks
- Login credentials: admin@aspiring.dk / password123

## Current Implementation Status
✅ Students CRUD - Fully functional
✅ Classes CRUD - Fully functional with modulperiode validation
✅ Student enrollment/unenrollment - Working
✅ Modulperiode system - Implemented with AspIT calendar logic
⏳ Attendance - Not implemented
⏳ Evaluations - Not implemented
⏳ Teachers admin - Not implemented

## Development Servers
- Frontend: http://localhost:5174 (Vite)
- Backend: http://localhost:8000 (Laravel)
- Database: localhost:3306 (XAMPP MySQL)

## Startup Commands
```powershell
# Start XAMPP (Apache + MySQL)

# Backend
cd StudentAdminAPI
php artisan serve

# Frontend
cd FrontEndTest
npm run dev
```

## Key Files
- `GETTING_STARTED.md` - Complete startup guide
- `MODULPERIODER.md` - Modulperiode system documentation
- `API_INTEGRATION.md` - API endpoints and database schema
- `TROUBLESHOOTING.md` - Common problems and solutions

