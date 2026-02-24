# Troubleshooting Guide

Løsninger på almindelige problemer med Student Administration System.

## 🚀 Opstart Problemer

### Backend starter ikke

**Problem:** `php artisan serve` fejler eller viser errors

**Løsninger:**
1. Check PHP version: `php --version` (skal være 8.3+)
2. Check at port 8000 er ledig:
   ```powershell
   netstat -ano | findstr :8000
   ```
3. Check .env fil - verificer database credentials
4. Kør migrations igen:
   ```bash
   php artisan migrate:fresh --seed
   ```

### Database connection error

**Problem:** `SQLSTATE[HY000] [2002] Connection refused`

**Løsninger:**
1. Check at XAMPP MySQL kører
2. Verificer database credentials i `.env`:
   ```
   DB_DATABASE=student_admin
   DB_USERNAME=root
   DB_PASSWORD=
   ```
3. Opret database manuelt hvis den ikke findes:
   ```bash
   mysql -u root -p -e "CREATE DATABASE student_admin"
   ```

### Frontend starter ikke

**Problem:** `npm run dev` fejler

**Løsninger:**
1. Slet `node_modules` og reinstaller:
   ```bash
   rm -rf node_modules
   npm install
   ```
2. Check Node.js version: `node --version` (skal være 18+)
3. Check at port 5174 er ledig

---

## 🔌 API Connection Problemer

### 401 Unauthorized

**Problem:** API requests fejler med 401 status

**Løsninger:**
1. Check at du er logget ind
2. Check at token er gemt i localStorage:
   ```javascript
   localStorage.getItem('authToken')
   ```
3. Log ud og ind igen
4. Check browser console for errors

### CORS Errors

**Problem:** Browser blokerer requests med CORS error

**Løsninger:**
1. Check at Laravel backend CORS er konfigureret korrekt
2. Verificer at `config/cors.php` inkluderer frontend URL:
   ```php
   'allowed_origins' => ['http://localhost:5174']
   ```
3. Clear browser cache og reload

### 422 Validation Error

**Problem:** API returnerer validation errors ved create/update

**Løsninger:**
1. Check request payload i Network tab
2. Verificer alle required felter er udfyldt:
   - Students: navn, fødselsdato, afdeling, kommune, lovgrundlag, startdato, spor, status
   - Classes: afdeling, lærer, fag, modulperiode
3. Check dato format (skal være YYYY-MM-DD)
4. Check enum values matcher backend

---

## 📅 Modulperiode Problemer

### Kan ikke oprette hold

**Problem:** "Kan ikke oprette hold for tidligere modulperioder"

**Forklaring:** Dette er forventet adfærd - systemet forhindrer oprettelse af hold for perioder der er forbi.

**Løsning:** Vælg en nuværende eller fremtidig modulperiode.

### Kan ikke redigere hold

**Problem:** "Rediger hold" knappen er ikke synlig

**Forklaring:** Hold med status "Afsluttet" kan ikke redigeres.

**Løsning:** Dette er forventet beskyttelse - afsluttede hold skal ikke kunne ændres.

---

## 🗃️ Data Problemer

### Elever vises ikke

**Problem:** Students siden er tom efter login

**Løsninger:**
1. Check API response i Network tab
2. Seed database hvis den er tom:
   ```bash
   php artisan db:seed
   ```
3. Check console for JavaScript errors
4. Verificer TanStack Query cache er ikke korrupt:
   ```javascript
   // I browser console
   localStorage.clear()
   location.reload()
   ```

### Ændringer gemmes ikke

**Problem:** Opdateringer forsvinder efter reload

**Løsninger:**
1. Check backend logs: `storage/logs/laravel.log`
2. Verificer database update faktisk sker:
   ```sql
   SELECT * FROM students WHERE id = ?;
   ```
3. Check TanStack Query mutation callbacks
4. Check Network tab for API response

---

## 🔍 Debug Tips

### Browser DevTools

1. **Console**: Check for JavaScript errors
2. **Network**: Inspect API requests og responses
   - Check request payload
   - Check response status code og body
   - Check request headers (Authorization token)
3. **Application > Local Storage**: Check authToken

### Laravel Debug

1. Check logs:
   ```bash
   tail -f storage/logs/laravel.log
   ```
2. Enable debug mode i `.env`:
   ```
   APP_DEBUG=true
   ```
3. Test API manually med PowerShell:
   ```powershell
   $token = (Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" `
     -Method POST -ContentType "application/json" `
     -Body (@{email="admin@aspiring.dk"; password="password123"} | ConvertTo-Json)).token
     
   Invoke-RestMethod -Uri "http://localhost:8000/api/students" `
     -Headers @{Authorization="Bearer $token"}
   ```

---

## 🆘 Stadig Problemer?

Hvis problemet fortsætter:

1. **Genstart alt**:
   - Stop backend (Ctrl+C)
   - Stop frontend (Ctrl+C)
   - Stop XAMPP MySQL
   - Start XAMPP MySQL
   - Start backend
   - Start frontend

2. **Fresh Install**:
   ```bash
   # Backend
   php artisan migrate:fresh --seed
   
   # Frontend
   rm -rf node_modules
   npm install
   ```

3. **Check dokumentation**:
   - [GETTING_STARTED.md](./GETTING_STARTED.md)
   - [API_INTEGRATION.md](./API_INTEGRATION.md)

---

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
