# Troubleshooting Guide

> ⚠️ **VIGTIGT:** Det eksterne API (`https://cv-pc-x-server:1102/api`) er sat på pause (Februar 2026).  
> Systemet kører nu med mock/static data. Denne guide er primært historisk reference.  
> Se [API_INTEGRATION.md](API_INTEGRATION.md) for aktuel status og fremtidig database plan.

## Almindelige Problemer og Løsninger

### 1. CORS Errors (HISTORISK - ikke aktuelt længere)

**Problem:** Browser blokerer requests med CORS error
```
Access to fetch at 'https://cv-pc-x-server:1102/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Løsning 1: Backend skal tilføje CORS headers**
```csharp
// I Startup.cs eller Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost",
        builder => builder
            .WithOrigins("http://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

app.UseCors("AllowLocalhost");
```

**Løsning 2: Brug Vite proxy** (midlertidig løsning)
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://cv-pc-x-server:1102',
        changeOrigin: true,
        secure: false, // For self-signed certificates
      }
    }
  }
})
```

Derefter i `api.ts`:
```typescript
const API_BASE_URL = '/api' // I stedet for fuld URL
```

### 2. HTTPS Certificate Errors

**Problem:** Browser viser "Your connection is not private" eller fetch fejler med certificate error

**Løsning:**
1. Åbn `https://cv-pc-x-server:1102/api/auth/login` direkte i browser
2. Klik "Advanced" → "Proceed to cv-pc-x-server (unsafe)"
3. Reload din React app

**Alternativ for Development:**
```typescript
// KUN TIL DEVELOPMENT - ALDRIG I PRODUKTION
// I Node.js environment (ikke browser)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
```

### 3. Authentication Fejler

**Problem:** Login returnerer 401 eller 403

**Debug steps:**
1. Verificer credentials i `api.ts` er korrekte
2. Check at API'et kører på den rigtige port
3. Se Network tab i DevTools for response body
4. Test login manuelt med Postman/Thunder Client

**Test med curl:**
```bash
curl -X POST https://cv-pc-x-server:1102/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ApiUser",
    "password": "6sLY2kOz4+L1IZGboOHlv52nfgkNk2aZAaygijy8NCw=",
    "adUsername": "cv\\keso"
  }'
```

### 4. Data Mapping Fejl

**Problem:** Data vises forkert eller komponenter crasher

**Debug:**
1. Åbn browser console
2. Kig efter TypeScript fejl
3. Check `studentApi.ts` mappings:
   - `mapDtoToStudent` - API → App
   - `mapStudentToDto` - App → API

**Test mapping:**
```typescript
import { compareStudentFormats } from './services/apiTestHelpers'

// I component:
useEffect(() => {
  if (students && students.length > 0) {
    compareStudentFormats(students[0], originalDto)
  }
}, [students])
```

### 5. Network Timeout

**Problem:** Requests tager for lang tid eller timeout

**Løsning:** Tilføj timeout til fetch i `api.ts`
```typescript
private async authenticatedFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000) // 10 sekunder

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      // ... rest
    })
    clearTimeout(timeout)
    return response.json()
  } catch (error) {
    clearTimeout(timeout)
    if (error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}
```

### 6. Development Server Connection Refused

**Problem:** Kan ikke nå API'et overhovedet

**Checklist:**
- [ ] Er API'et/backend serveren kørt?
- [ ] Kører den på den rigtige port (1102)?
- [ ] Er du på samme netværk?
- [ ] Kan du ping'e `cv-pc-x-server`?
- [ ] Tillader firewall forbindelsen?

**Test forbindelse:**
```bash
# Windows
ping cv-pc-x-server
telnet cv-pc-x-server 1102

# PowerShell
Test-NetConnection -ComputerName cv-pc-x-server -Port 1102
```

### 7. TanStack Query Cache Issues

**Problem:** Gammel data vises selvom API er opdateret

**Løsning:**
```typescript
// Force refresh alle queries
import { useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()
queryClient.invalidateQueries({ queryKey: studentKeys.all })

// Eller clear entire cache
queryClient.clear()
```

## Debug Tools

### Browser DevTools
1. **Network tab** - Se alle API requests og responses
2. **Console** - Se JavaScript fejl og logs
3. **Application/Storage** - Se localStorage (auth token)

### TanStack Query DevTools
- Klik på det lille React Query ikon nederst i venstre hjørne
- Se query status, cache, og refetch queries manuelt

### VS Code Extensions
- **Thunder Client** - Test API endpoints direkte i VS Code
- **REST Client** - Send HTTP requests fra .http filer

## Kontakt Backend Team

Hvis ingen af ovenstående løser problemet, kontakt backend teamet med:
1. Fejlbesked fra browser console
2. Network tab screenshot
3. Request payload og response
4. Browser og OS version
