# 🚀 Getting Started - Student Administration System

Dette dokument forklarer hvordan du starter hele systemet lokalt.

## System Oversigt

Systemet består af:
- **Backend API**: Laravel 12 (PHP 8.3+)
- **Database**: MySQL via XAMPP
- **Frontend**: React 19 + TypeScript + Vite 7

## Forudsætninger

Før du starter skal du have følgende installeret:
- ✅ PHP 8.3 eller nyere
- ✅ Composer (PHP package manager)
- ✅ XAMPP (Apache + MySQL)
- ✅ Node.js 18+ og npm

## 📋 Opstart Guide

### 1. Start Database (XAMPP)

1. Åbn **XAMPP Control Panel**
2. Start **Apache**
3. Start **MySQL**

Databasen kører nu på `localhost:3306`.

### 2. Start Backend API (Laravel)

Åbn en terminal og kør:

```powershell
cd "C:\Users\KESO\Desktop\KESO\_Personlige ting og projekter\StudentAdminAPI"
php artisan serve
```

✅ Backend API kører nu på **http://localhost:8000**

### 3. Start Frontend (React + Vite)

Åbn en NY terminal og kør:

```powershell
cd "C:\Users\KESO\Desktop\KESO\_Personlige ting og projekter\FrontEndTest"
npm run dev
```

✅ Frontend kører nu på **http://localhost:5174**

### 4. Log ind

Åbn browseren på `http://localhost:5174` og log ind med:

- **Email**: `admin@aspiring.dk`
- **Password**: `password123`

## 🎉 Klar til brug!

Du har nu adgang til:
- ✅ **Dashboard** - Oversigt
- ✅ **Elever (Students)** - Fuldt CRUD med API
- ✅ **Hold (Classes)** - Fuldt CRUD med modulperiode validering
- ⏳ **Fremmøde (Attendance)** - Not implemented yet
- ⏳ **Evaluations** - Not implemented yet

## 🗃️ Seeded Data

Databasen er seeded med test data:
- **6 teachers** (Anders, Bent, Christina, Dennis, Eva, Frank)
- **5 classes** (forskellige hold med modulperioder)
- **6 students** (test elever)
- **1 admin user** (admin@aspiring.dk)

## 🔍 API Endpoints

Backend API dokumentation:

### Authentication
- `POST /api/auth/login` - Login og få bearer token
- `POST /api/auth/logout` - Logout

### Students
- `GET /api/students` - Hent alle elever
- `POST /api/students` - Opret ny elev
- `GET /api/students/{id}` - Hent enkelt elev
- `PUT /api/students/{id}` - Opdater elev
- `DELETE /api/students/{id}` - Slet elev

### Classes
- `GET /api/classes` - Hent alle hold
- `POST /api/classes` - Opret nyt hold
- `GET /api/classes/{id}` - Hent enkelt hold
- `PUT /api/classes/{id}` - Opdater hold
- `DELETE /api/classes/{id}` - Slet hold
- `POST /api/classes/{id}/enroll` - Tilføj elev til hold
- `DELETE /api/classes/{id}/students/{studentId}` - Fjern elev fra hold

## 🛠️ Troubleshooting

### Backend starter ikke
- Check at PHP er installeret: `php --version`
- Check at port 8000 er ledig
- Prøv at stoppe og genstarte: `Ctrl+C` og `php artisan serve` igen

### Frontend starter ikke
- Slet `node_modules` og kør `npm install` igen
- Check at port 5174 er ledig
- Prøv `npm run build` for at se om der er build errors

### Database problemer
- Check at MySQL kører i XAMPP
- Check connection i `.env` filen i backend projektet
- Prøv at køre migrations igen: `php artisan migrate:fresh --seed`

### API Connection Errors
- Check at backend kører på http://localhost:8000
- Check browser console for CORS errors
- Verificer at `src/services/api.ts` peger på korrekt URL

## 📚 Næste Skridt

- Se [MODULPERIODER.md](./MODULPERIODER.md) for info om modulperiode systemet
- Se [API_INTEGRATION.md](./API_INTEGRATION.md) for komplet API dokumentation
- Se [README.md](./README.md) for tech stack og projekt struktur

## 🔄 Genstart Alt

Hvis du skal genstarte hele systemet:

1. **Stop alt**: `Ctrl+C` i begge terminaler
2. **Stop XAMPP**: Stop Apache + MySQL
3. **Start forfra**: Følg trin 1-3 ovenfor
