# ⚠️ DEPRECATED - Mock API Guide

> **Dette dokument er outdated.** Systemet bruger ikke længere mock API eller JSON Server.  
> Se [GETTING_STARTED.md](./GETTING_STARTED.md) for aktuel opsætning med Laravel backend.

---

# Mock API Guide (Historical Reference)

Dette projekt kan nu køre med enten en **mock API** (JSON Server) eller **rigtig backend**.

## 🎯 Hurtig Start

### Brug Mock API (anbefalet under udvikling)

```bash
npm run dev:mock
```

Dette starter både JSON Server (port 3001) og Vite dev server (port 5173) samtidigt.

### Brug Rigtig Backend

1. Skift mode i `src/config/apiConfig.ts`:
   ```typescript
   mode: 'real' // Skift fra 'mock' til 'real'
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

## 📁 Mock Data

Mock data gemmes i `db.json`. JSON Server giver automatisk følgende endpoints:

### Students
- `GET /students` - Hent alle studerende
- `GET /students/:id` - Hent enkelt studerende
- `POST /students` - Opret ny studerende
- `PUT /students/:id` - Opdater studerende
- `PATCH /students/:id` - Opdater enkelte felter
- `DELETE /students/:id` - Slet studerende

### Classes
- `GET /classes` - Hent alle hold
- `GET /classes/:id` - Hent enkelt hold
- osv.

### Attendance
- `GET /attendance` - Hent fremmødedata
- osv.

## 🔍 Søgning og Filtrering

JSON Server understøtter automatisk:

```
# Søg i alle felter
GET /students?q=Anders

# Filter på specifikke felter
GET /students?afdeling=Trekanten
GET /students?status=Indskrevet

# Sortering
GET /students?_sort=navn&_order=asc

# Paginering
GET /students?_page=1&_limit=10

# Relationer (hvis du tilføjer dem)
GET /students?_embed=attendance
```

## 🛠️ Tilpas Mock Data

Rediger `db.json` direkte:

```json
{
  "students": [
    {
      "id": 1,
      "navn": "Anders Jensen",
      ...
    }
  ]
}
```

JSON Server gemmer automatisk ændringer tilbage til filen når du bruger API'et.

## ⚙️ Konfiguration

### Skift mellem Mock og Rigtig API

Rediger `src/config/apiConfig.ts`:

```typescript
export const API_CONFIG = {
  mode: 'mock', // eller 'real'
  ...
}
```

### Mock API Indstillinger

- **Port**: 3001 (kan ændres i `package.json` script)
- **Database fil**: `db.json`
- **Base URL**: `http://localhost:3001`

### Rigtig API Indstillinger

- **Development**: Bruger Vite proxy (`/api` → `cv-pc-x-server:1102`)
- **Production**: Direkte URL til backend
- **Auth**: Token-baseret authentication

## 🔄 Fordele ved Mock API

1. **Uafhængig udvikling** - Frontend team kan arbejde uden backend
2. **Hurtig feedback** - Ingen netværks-latency
3. **Test data** - Let at lave forskellige test-scenarios
4. **Offline udvikling** - Virker uden netværksforbindelse
5. **Data persistering** - Ændringer gemmes i `db.json`

## 🚀 Deployment

Ved deployment (f.eks. til Vercel) sker der automatisk følgende:

1. **Auto-detect production** - `apiConfig.ts` detekterer at vi er i production
2. **Skifter til 'static' mode** - Bruger in-memory mock data i stedet for JSON Server
3. **Fuld CRUD virker** - Alle operationer virker, men data persisterer ikke mellem page reloads

### Deployment Modes

- **Development (local)**: Bruger JSON Server (`mode: 'mock'`)
  - Data persisterer i `db.json`
  - Kræver `npm run dev:mock`

- **Production (Vercel/Netlify)**: Bruger in-memory data (`mode: 'static'`)
  - Data er hardcoded i `src/data/mockData.ts`
  - Data nulstilles ved page reload
  - Intet server krævet

- **Real Backend**: Forbinder til rigtig API (`mode: 'real'`)
  - Skift manuelt i `apiConfig.ts`
  - Kræver backend server

### Manual Override

Hvis du vil teste static mode lokalt:

```typescript
// src/config/apiConfig.ts
mode: 'static' // I stedet for 'mock'
```

## 📚 Yderligere Ressourcer

- [JSON Server Documentation](https://github.com/typicode/json-server)
- [JSON Server CLI Options](https://github.com/typicode/json-server#cli-usage)

## 🐛 Troubleshooting

### Port 3001 er allerede i brug

Stop anden proces eller skift port i `package.json`:
```json
"mock-api": "json-server --watch db.json --port 3002"
```

### Data bliver ikke gemt

Check at `db.json` ikke er read-only og at du har skriveadgang.

### API kalder fejler

1. Check at mock API kører (se terminal output)
2. Verificer at `mode: 'mock'` i `apiConfig.ts`
3. Check browser console for fejl
