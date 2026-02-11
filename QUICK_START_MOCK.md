# Quick Start: Mock API

## 🚀 Kom i gang på 30 sekunder

```bash
# 1. Kør dette kommando
npm run dev:mock

# 2. Åbn browser på http://localhost:5174
#    (eller den port Vite viser i terminalen)
```

**Det er det!** Du har nu:
- ✅ JSON Server API på port 3001
- ✅ Vite dev server på port 5174
- ✅ Fuld CRUD funktionalitet
- ✅ Data persisterer i db.json

## 📖 Test API'et

Åbn en ny terminal og prøv:

```bash
# Hent alle studerende
curl http://localhost:3001/students

# Hent enkelt studerende
curl http://localhost:3001/students/1

# Opret ny studerende (Windows PowerShell)
Invoke-RestMethod -Uri "http://localhost:3001/students" -Method Post -Body (@{
  navn = "Test Person"
  afdeling = "Trekanten"
  status = "Indskrevet"
} | ConvertTo-Json) -ContentType "application/json"
```

## 🔄 Skift til Rigtig Backend

1. Åbn `src/config/apiConfig.ts`
2. Skift `mode: 'mock'` til `mode: 'real'`
3. Genstart dev server

## 📝 Rediger Data

Åbn `db.json` og rediger direkte - JSON Server opdaterer automatisk.

---

Se [MOCK_API_GUIDE.md](./MOCK_API_GUIDE.md) for komplet dokumentation.
