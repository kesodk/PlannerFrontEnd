<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Student Administration System

Dette er en moderne React TypeScript frontend til administration af elever, hold og fremmøderegistrering.

## Tech Stack
- React 19 + TypeScript
- Vite 7 som build tool
- Mantine 8 UI bibliotek
- React Router v7 til navigation
- TanStack Query til data management
- React Hook Form + Zod til formularer
- AG Grid Community til tabeller
- SignalR til real-time funktioner
- Vitest + React Testing Library til testing

## Udviklings Guidelines
- Brug Mantine komponenter hvor muligt
- Følg React Hook patterns
- Implementer proper TypeScript typing
- Tilføj tests for nye funktioner
- Brug TanStack Query til API calls
- Follow responsive design principper

## Projektstruktur
- `/src/components/` - Genbrugelige komponenter
- `/src/pages/` - Hovedsider (Dashboard, Students, Classes, Attendance)
- `/src/test/` - Test setup og utilities

Development server kører på http://localhost:5173
