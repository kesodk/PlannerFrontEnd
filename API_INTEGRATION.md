# API Integration Guide

## ✅ Nuværende Status (Februar 2026)

Systemet kører nu med **egen Laravel 12 backend** og **MySQL database** via XAMPP.

- **Backend**: Laravel 12, PHP 8.3+
- **Database**: MySQL via XAMPP
- **Authentication**: Laravel Sanctum (Bearer token)
- **API Base URL**: `http://localhost:8000/api`

## 🚀 API Oversigt

### Base Configuration

API konfiguration findes i `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8000/api'

// Authentication headers
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
})
```

## 🔐 Authentication

### Login

**Endpoint**: `POST /api/auth/login`

**Request:**
```json
{
  "email": "admin@aspiring.dk",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "1|abc123...",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@aspiring.dk"
  }
}
```

### Logout

**Endpoint**: `POST /api/auth/logout`

**Headers**: `Authorization: Bearer {token}`

**Response**: `204 No Content`

---

## 👥 Students API

### Get All Students

**Endpoint**: `GET /api/students`

**Response:**
```json
[
  {
    "id": 1,
    "navn": "Anders Jensen",
    "fødselsdato": "2005-03-15",
    "cpr": "1503052345",
    "adresse": "Skolegade 12, 8000 Aarhus C",
    "telefonnr": "12345678",
    "email": "anders@example.com",
    "forældreNavn": "Lars og Mette Jensen",
    "forældreTelefon": "87654321, 23456789",
    "forældreAdresse": "Skolegade 12, 8000 Aarhus C",
    "forældreEmail": "lars@example.com, mette@example.com",
    "afdeling": "Trekanten",
    "kursistnr": "K2024001",
    "kommune": "Aarhus",
    "lovgrundlag": "STU",
    "vejlederNavn": "Jens Nielsen",
    "vejlederTlf": "98765432",
    "vejlederEmail": "jens@jobcenter.dk",
    "startdato": "2024-08-01",
    "slutdato": null,
    "spor": "AspIT",
    "status": "Indskrevet"
  }
]
```

### Get Single Student

**Endpoint**: `GET /api/students/{id}`

### Create Student

**Endpoint**: `POST /api/students`

**Request Body**: Same structure as student object above (without `id`)

### Update Student

**Endpoint**: `PUT /api/students/{id}`

**Request Body**: Same structure as student object

### Delete Student

**Endpoint**: `DELETE /api/students/{id}`

**Response**: `204 No Content`

---

## 📚 Classes API

### Get All Classes

**Endpoint**: `GET /api/classes`

**Response:**
```json
[
  {
    "id": 1,
    "navn": "26-1-M1-Intro til HTML og CSS-Anders",
    "afdeling": "Trekanten",
    "lærer": "Anders",
    "fag": "Intro til HTML og CSS",
    "modulperiode": "26-1-M1",
    "startdato": "2026-01-05",
    "slutdato": "2026-02-28",
    "status": "Igangværende",
    "students": [
      {
        "id": 1,
        "navn": "Anders Jensen",
        "afdeling": "Trekanten"
      }
    ]
  }
]
```

### Get Single Class

**Endpoint**: `GET /api/classes/{id}`

### Create Class

**Endpoint**: `POST /api/classes`

**Request:**
```json
{
  "afdeling": "Trekanten",
  "lærer": "Anders",
  "fag": "Intro til HTML og CSS",
  "modulperiode": "26-1-M2"
}
```

**Response:** Created class object with auto-generated fields:
- `navn`: Generated from `modulperiode-fag-lærer`
- `startdato` & `slutdato`: Calculated from modulperiode
- `status`: Auto-calculated based on dates

### Update Class

**Endpoint**: `PUT /api/classes/{id}`

**Request:** Same structure as create

### Delete Class

**Endpoint**: `DELETE /api/classes/{id}`

**Response**: `204 No Content`

### Enroll Student

**Endpoint**: `POST /api/classes/{classId}/enroll`

**Request:**
```json
{
  "student_id": 1
}
```

### Unenroll Student

**Endpoint**: `DELETE /api/classes/{classId}/students/{studentId}`

**Response**: `204 No Content`

---

## 🏗️ Database Structure

### Students Table
```sql
CREATE TABLE students (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  navn VARCHAR(255) NOT NULL,
  fødselsdato DATE NOT NULL,
  cpr VARCHAR(11),
  adresse TEXT,
  telefonnr VARCHAR(20),
  email VARCHAR(255),
  forældreNavn TEXT,
  forældreTelefon TEXT,
  forældreAdresse TEXT,
  forældreEmail TEXT,
  afdeling ENUM('Trekanten', 'Østjylland', 'Sønderjylland', 'Storkøbenhavn') NOT NULL,
  kursistnr VARCHAR(50),
  kommune VARCHAR(100) NOT NULL,
  lovgrundlag ENUM('STU', 'LAB', 'Privat', 'Andet') NOT NULL,
  vejlederNavn VARCHAR(255),
  vejlederTlf VARCHAR(20),
  vejlederEmail VARCHAR(255),
  startdato DATE NOT NULL,
  slutdato DATE,
  spor ENUM('AspIT', 'AspIN') NOT NULL,
  status ENUM('UP/Afklaring', 'Indskrevet') NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);
```

### Classes Table
```sql
CREATE TABLE classes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  navn VARCHAR(255) NOT NULL,
  afdeling ENUM('Trekanten', 'Østjylland', 'Sønderjylland', 'Storkøbenhavn') NOT NULL,
  lærer VARCHAR(50) NOT NULL,
  fag VARCHAR(100) NOT NULL,
  modulperiode VARCHAR(20) NOT NULL,
  startdato DATE NOT NULL,
  slutdato DATE NOT NULL,
  status ENUM('Igangværende', 'Fremtidig', 'Afsluttet') NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);
```

### Class_Student Pivot Table
```sql
CREATE TABLE class_student (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  class_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE KEY class_student_unique (class_id, student_id)
);
```

---

## 🔄 Frontend Integration

### TanStack Query Hooks

Students hooks findes i `src/services/studentApi.ts`:

```typescript
// Fetch all students
const { data: students, isLoading } = useStudents()

// Create student
const createMutation = useCreateStudent()
await createMutation.mutateAsync(studentData)

// Update student  
const updateMutation = useUpdateStudent()
await updateMutation.mutateAsync({ id, data: studentData })

// Delete student
const deleteMutation = useDeleteStudent()
await deleteMutation.mutateAsync(id)
```

Classes hooks findes i `src/services/classApi.ts`:

```typescript
// Fetch all classes
const { data: classes } = useClasses()

// Create class
const createMutation = useCreateClass()
await createMutation.mutateAsync(classData)

// Enroll student
const enrollMutation = useEnrollStudent()
await enrollMutation.mutateAsync({ classId, studentId })

// Unenroll student
const unenrollMutation = useUnenrollStudent()
await unenrollMutation.mutateAsync({ classId, studentId })
```

---

## ⚠️ Error Handling

API returnerer standard HTTP statuskoder:

- `200` - Success
- `201` - Created
- `204` - No Content (success, no body)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `422` - Unprocessable Entity (validation errors)
- `500` - Server Error

Frontend håndterer errors via TanStack Query:

```typescript
const { data, isError, error } = useStudents()

if (isError) {
  console.error('API Error:', error)
  // Show error message to user
}
```

---

## 🧪 Testing API

### Manual Testing (PowerShell)

```powershell
# Login
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body (@{email="admin@aspiring.dk"; password="password123"} | ConvertTo-Json)
$token = $response.token

# Get students
Invoke-RestMethod -Uri "http://localhost:8000/api/students" `
  -Headers @{Authorization="Bearer $token"}

# Get classes
Invoke-RestMethod -Uri "http://localhost:8000/api/classes" `
  -Headers @{Authorization="Bearer $token"}
```

---

## 📝 Seeded Data

Database seeders opretter test data:

- **Users**: 1 admin user (admin@aspiring.dk)
- **Teachers**: 6 teachers (Anders, Bent, Christina, Dennis, Eva, Frank)
- **Students**: 6 test students
- **Classes**: 5 test classes med forskellige modulperioder

---

## 🚧 Ikke Implementeret Endnu

Følgende features er planlagt men ikke implementeret:

- **Attendance (Fremmøde)**: Daglig fremmøderegistrering
- **Evaluations**: Formativ og summativ evaluering
- **Assessments**: Karakterer og bedømmelser
- **Teachers CRUD**: Administration af lærere
- **Real-time updates**: SignalR integration

---

## 📚 Se Også

- [GETTING_STARTED.md](./GETTING_STARTED.md) - Hvordan du starter systemet
- [MODULPERIODER.md](./MODULPERIODER.md) - Forklaring af modulperiode systemet
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Løsninger på almindelige problemer

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `class_enrollments` - Elev-hold tilknytning (many-to-many)
```sql
CREATE TABLE class_enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  enrollment_date DATE NOT NULL,
  
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (student_id, class_id),
  
  INDEX idx_student (student_id),
  INDEX idx_class (class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Evaluering Tabeller

#### `evaluations` - Hoved evaluerings tabel
```sql
CREATE TABLE evaluations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  type ENUM('Formativ', 'Summativ') NOT NULL,
  dato DATE NOT NULL,
  modulperiode VARCHAR(20) NOT NULL,
  oprettet_af VARCHAR(50) NOT NULL, -- Lærer initialer
  
  -- Evaluering af seneste mål
  evaluering_seneste_mål TEXT,
  
  -- Næste modul prioriteter
  næste_modul_prioritet_1 VARCHAR(100),
  næste_modul_prioritet_2 VARCHAR(100),
  næste_modul_prioritet_3 VARCHAR(100),
  
  -- Bemærkninger til valg af fag
  bemærkninger TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  
  INDEX idx_student (student_id),
  INDEX idx_type (type),
  INDEX idx_dato (dato)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `evaluation_goals` - Målområder (formativ evaluering)
```sql
CREATE TABLE evaluation_goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evaluation_id INT NOT NULL,
  goal_type ENUM('fagligt', 'personligt', 'socialt', 'arbejdsmæssigt') NOT NULL,
  
  -- De 4 felter for hvert mål
  individuelle_mål TEXT,
  læringsmål TEXT,
  indhold_og_handlinger TEXT,
  opfyldelseskriterier TEXT,
  
  FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE,
  
  INDEX idx_evaluation (evaluation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `summative_evaluations` - Summativ evaluering tekster
```sql
CREATE TABLE summative_evaluations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evaluation_id INT NOT NULL,
  evaluator_type ENUM('elev', 'lærer') NOT NULL,
  
  -- De 5 felter for summativ evaluering
  fagligt TEXT,
  personligt TEXT,
  socialt TEXT,
  arbejdsmæssigt TEXT,
  øvrig_evaluering TEXT,
  
  FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_evaluator (evaluation_id, evaluator_type),
  
  INDEX idx_evaluation (evaluation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Bedømmelse Tabeller

#### `module_periods` - Modulperioder og fagbeskrivelser
```sql
CREATE TABLE module_periods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  modulperiode VARCHAR(20) NOT NULL, -- f.eks. "24-1-M1"
  fag VARCHAR(100) NOT NULL, -- f.eks. "V1", "S2"
  fagbeskrivelse TEXT, -- f.eks. "Web Introduction"
  bedømmelse VARCHAR(50), -- Kan være karakter eller tekst
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  
  INDEX idx_student (student_id),
  INDEX idx_modulperiode (modulperiode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Reference Tabeller

#### `subjects` - Fag/Kurser (referencedata)
```sql
CREATE TABLE subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode VARCHAR(50) UNIQUE NOT NULL, -- f.eks. "V1", "S2", "T1"
  navn VARCHAR(255) NOT NULL, -- f.eks. "Web Introduction"
  beskrivelse TEXT,
  spor ENUM('AspIT', 'AspIN', 'Fælles'),
  
  INDEX idx_kode (kode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `teachers` - Lærere (referencedata)
```sql
CREATE TABLE teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  initialer VARCHAR(10) UNIQUE NOT NULL, -- f.eks. "KESO", "JOES"
  navn VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefon VARCHAR(20),
  afdelinger JSON, -- Array af afdelinger læreren er tilknyttet
  aktiv BOOLEAN DEFAULT TRUE,
  
  INDEX idx_initialer (initialer)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `users` - Bruger login/authentication
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  teacher_id INT,
  role ENUM('admin', 'lærer', 'vejleder') NOT NULL DEFAULT 'lærer',
  aktiv BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
  
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Fremtidig Udvidelse (Ikke implementeret endnu)

#### `attendance` - Fremmøde registrering
```sql
CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  dato DATE NOT NULL,
  status ENUM('tilstede', 'fraværende', 'syg', 'lovligt_fravær') NOT NULL,
  bemærkning TEXT,
  registreret_af VARCHAR(50),
  registreret_tidspunkt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  
  UNIQUE KEY unique_attendance (student_id, class_id, dato),
  INDEX idx_dato (dato),
  INDEX idx_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### `planning` - Planlægning (fremtidig funktionalitet)
```sql
CREATE TABLE planning (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  semester VARCHAR(20) NOT NULL,
  uge INT,
  aktivitet TEXT,
  type ENUM('undervisning', 'praktik', 'projekt', 'eksamen'),
  
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  
  INDEX idx_student (student_id),
  INDEX idx_semester (semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 📊 Database Relationer

```
students (1) ─────< (∞) class_enrollments (∞) ─────> (1) classes
    │
    │
    ├─────< (∞) evaluations
    │              │
    │              ├─────< (4) evaluation_goals (fagligt, personligt, socialt, arbejdsmæssigt)
    │              │
    │              └─────< (2) summative_evaluations (elev, lærer)
    │
    └─────< (∞) module_periods


teachers (1) ─────< (∞) classes
    │
    └─────< (1) users
```

## 🔄 Migration Status

### Hvad virker nu (med mock data):
- ✅ Elev liste og søgning
- ✅ Hold/klasse oversigt
- ✅ Formativ evaluering (4 målområder)
- ✅ Summativ evaluering (elev + lærer)
- ✅ Bedømmelser (modulperioder og karakterer)
- ✅ Dashboard med statistik

### Hvad skal implementeres:
- ⏳ MySQL database setup
- ⏳ Backend API (PHP/Laravel) ⭐ **VALGT TEKNOLOGI**
- ⏳ Authentication system
- ⏳ Fremmøderegistrering
- ⏳ Planlægning funktionalitet
- ⏳ Diplom generering
- ⏳ PDF/Word export af evalueringer

---

## 🚀 Laravel Backend Implementation Guide

**Valgt teknologi:** PHP 8.3+ med Laravel 11.x

**Hvorfor Laravel:**
- ✅ Moden MySQL/Eloquent ORM integration
- ✅ Built-in authentication (Sanctum)
- ✅ API Resources til JSON formatering
- ✅ Migrations system til database versioning
- ✅ Validation og form requests
- ✅ Erfaring med PHP i teamet

### 📋 Implementation Roadmap

#### **FASE 1: Projekt Setup** (30 minutter)

**Step 1.1: Installer Laravel**
```bash
# Naviger til projekt parent folder
cd "C:\Users\KESO\Desktop\KESO\_Personlige ting og projekter"

# Opret nyt Laravel projekt (kræver Composer)
composer create-project laravel/laravel StudentAdminAPI

cd StudentAdminAPI

# Installer Laravel Sanctum til API authentication
php artisan install:api
```

**Step 1.2: Database Configuration**

Opdater `.env` fil:
```env
APP_NAME="Student Administration API"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=student_admin
DB_USERNAME=root
DB_PASSWORD=din_mysql_password

# CORS for frontend
FRONTEND_URL=http://localhost:5173
```

**Step 1.3: CORS Setup**

Opdater `config/cors.php`:
```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],
    'allowed_methods' => ['*'],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

---

#### **FASE 2: Database Migrations** (1-2 timer)

**Step 2.1: Opret Migrations**
```bash
# Core tables
php artisan make:migration create_students_table
php artisan make:migration create_teachers_table
php artisan make:migration create_classes_table
php artisan make:migration create_class_enrollments_table

# Evaluation tables
php artisan make:migration create_evaluations_table
php artisan make:migration create_evaluation_goals_table
php artisan make:migration create_summative_evaluations_table

# Assessment tables
php artisan make:migration create_subjects_table
php artisan make:migration create_module_periods_table

# Future features
php artisan make:migration create_attendance_table
php artisan make:migration create_planning_table
```

**Step 2.2: Students Migration Example**

`database/migrations/YYYY_MM_DD_create_students_table.php`:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            
            // Personlige oplysninger
            $table->string('navn');
            $table->date('fødselsdato');
            $table->string('cpr', 11)->unique()->nullable();
            $table->text('adresse')->nullable();
            $table->string('telefonnr', 20)->nullable();
            $table->string('email')->nullable();
            
            // Forældre information
            $table->text('forældreNavn')->nullable();
            $table->text('forældreTelefon')->nullable();
            $table->text('forældreAdresse')->nullable();
            $table->text('forældreEmail')->nullable();
            
            // Uddannelsesoplysninger
            $table->enum('afdeling', ['Trekanten', 'Østjylland', 'Sønderjylland', 'Storkøbenhavn']);
            $table->string('kursistnr', 50)->unique()->nullable();
            $table->string('kommune', 100);
            $table->enum('lovgrundlag', ['STU', 'LAB', 'Privat', 'Andet']);
            $table->string('vejlederNavn')->nullable();
            $table->string('vejlederTlf', 20)->nullable();
            $table->string('vejlederEmail')->nullable();
            $table->date('startdato');
            $table->date('slutdato')->nullable();
            $table->enum('spor', ['AspIT', 'AspIN']);
            $table->enum('status', ['UP/Afklaring', 'Indskrevet'])->default('Indskrevet');
            
            $table->timestamps();
            
            // Indexes
            $table->index('afdeling');
            $table->index('status');
            $table->index('spor');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
```

**Step 2.3: Run Migrations**
```bash
# Opret databasen hvis den ikke findes
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS student_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Kør migrations
php artisan migrate
```

---

#### **FASE 3: Eloquent Models** (1 time)

**Step 3.1: Opret Models**
```bash
php artisan make:model Student
php artisan make:model Teacher
php artisan make:model ClassModel
php artisan make:model ClassEnrollment
php artisan make:model Evaluation
php artisan make:model EvaluationGoal
php artisan make:model SummativeEvaluation
php artisan make:model Subject
php artisan make:model ModulePeriod
```

**Step 3.2: Student Model Example**

`app/Models/Student.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    protected $fillable = [
        'navn', 'fødselsdato', 'cpr', 'adresse', 'telefonnr', 'email',
        'forældreNavn', 'forældreTelefon', 'forældreAdresse', 'forældreEmail',
        'afdeling', 'kursistnr', 'kommune', 'lovgrundlag',
        'vejlederNavn', 'vejlederTlf', 'vejlederEmail',
        'startdato', 'slutdato', 'spor', 'status'
    ];

    protected $casts = [
        'fødselsdato' => 'date',
        'startdato' => 'date',
        'slutdato' => 'date',
    ];

    // Relationships
    public function classes(): BelongsToMany
    {
        return $this->belongsToMany(ClassModel::class, 'class_enrollments')
                    ->withTimestamps();
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class);
    }

    public function modulePeriods(): HasMany
    {
        return $this->hasMany(ModulePeriod::class);
    }
}
```

**Step 3.3: ClassModel Example**

`app/Models/ClassModel.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ClassModel extends Model
{
    protected $table = 'classes';

    protected $fillable = [
        'navn', 'afdeling', 'lærer', 'fag', 'modulperiode',
        'startdato', 'slutdato', 'status'
    ];

    protected $casts = [
        'startdato' => 'date',
        'slutdato' => 'date',
    ];

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'class_enrollments')
                    ->withTimestamps();
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'lærer', 'id');
    }
}
```

---

#### **FASE 4: API Controllers** (2-3 timer)

**Step 4.1: Opret Controllers**
```bash
php artisan make:controller Api/StudentController --api --model=Student
php artisan make:controller Api/ClassController --api --model=ClassModel
php artisan make:controller Api/EvaluationController --api --model=Evaluation
php artisan make:controller Api/AssessmentController --api
php artisan make:controller Api/AuthController
```

**Step 4.2: StudentController Example**

`app/Http/Controllers/Api/StudentController.php`:
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Http\Resources\StudentResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentController extends Controller
{
    /**
     * Display a listing of students.
     */
    public function index(Request $request)
    {
        $query = Student::query()->with('classes');

        // Search functionality
        if ($search = $request->input('search')) {
            $query->where('navn', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('kursistnr', 'like', "%{$search}%");
        }

        // Filter by afdeling
        if ($afdeling = $request->input('afdeling')) {
            $query->where('afdeling', $afdeling);
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $students = $query->get();
        
        return StudentResource::collection($students);
    }

    /**
     * Store a newly created student.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'navn' => 'required|string|max:255',
            'fødselsdato' => 'required|date',
            'email' => 'nullable|email',
            'afdeling' => 'required|in:Trekanten,Østjylland,Sønderjylland,Storkøbenhavn',
            'kommune' => 'required|string|max:100',
            'lovgrundlag' => 'required|in:STU,LAB,Privat,Andet',
            'startdato' => 'required|date',
            'spor' => 'required|in:AspIT,AspIN',
            'status' => 'required|in:UP/Afklaring,Indskrevet',
            // ... alle andre felter
        ]);

        $student = Student::create($validated);
        
        return new StudentResource($student);
    }

    /**
     * Display the specified student.
     */
    public function show(Student $student)
    {
        return new StudentResource($student->load(['classes', 'evaluations']));
    }

    /**
     * Update the specified student.
     */
    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'navn' => 'sometimes|string|max:255',
            'fødselsdato' => 'sometimes|date',
            'email' => 'nullable|email',
            // ... validation rules
        ]);

        $student->update($validated);
        
        return new StudentResource($student);
    }

    /**
     * Remove the specified student.
     */
    public function destroy(Student $student)
    {
        $student->delete();
        
        return response()->json(['message' => 'Student deleted successfully']);
    }
}
```

---

#### **FASE 5: API Resources** (1 time)

**Step 5.1: Opret Resources**
```bash
php artisan make:resource StudentResource
php artisan make:resource ClassResource
php artisan make:resource EvaluationResource
```

**Step 5.2: StudentResource Example**

`app/Http/Resources/StudentResource.php`:
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'navn' => $this->navn,
            'fødselsdato' => $this->fødselsdato?->format('Y-m-d'),
            'cpr' => $this->cpr,
            'adresse' => $this->adresse,
            'telefonnr' => $this->telefonnr,
            'email' => $this->email,
            'forældreNavn' => $this->forældreNavn,
            'forældreTelefon' => $this->forældreTelefon,
            'forældreAdresse' => $this->forældreAdresse,
            'forældreEmail' => $this->forældreEmail,
            'afdeling' => $this->afdeling,
            'kursistnr' => $this->kursistnr,
            'kommune' => $this->kommune,
            'lovgrundlag' => $this->lovgrundlag,
            'vejlederNavn' => $this->vejlederNavn,
            'vejlederTlf' => $this->vejlederTlf,
            'vejlederEmail' => $this->vejlederEmail,
            'startdato' => $this->startdato?->format('Y-m-d'),
            'slutdato' => $this->slutdato?->format('Y-m-d'),
            'spor' => $this->spor,
            'status' => $this->status,
            'classes' => ClassResource::collection($this->whenLoaded('classes')),
            'evaluations' => EvaluationResource::collection($this->whenLoaded('evaluations')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
```

---

#### **FASE 6: Authentication** (1 time)

**Step 6.1: AuthController**

`app/Http/Controllers/Api/AuthController.php`:
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login user and generate token
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]
        ]);
    }

    /**
     * Logout user (revoke token)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        return response()->json(['user' => $request->user()]);
    }
}
```

**Step 6.2: Opret test bruger**
```bash
php artisan tinker
```
```php
User::create([
    'name' => 'Admin',
    'email' => 'admin@aspiring.dk',
    'password' => Hash::make('password123')
]);
```

---

#### **FASE 7: API Routes** (30 minutter)

**Step 7.1: Definer Routes**

`routes/api.php`:
```php
<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\ClassController;
use App\Http\Controllers\Api\EvaluationController;
use App\Http\Controllers\Api\AssessmentController;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    // Students
    Route::apiResource('students', StudentController::class);
    
    // Classes
    Route::apiResource('classes', ClassController::class);
    Route::post('classes/{class}/enroll', [ClassController::class, 'enrollStudent']);
    Route::delete('classes/{class}/unenroll/{student}', [ClassController::class, 'unenrollStudent']);
    
    // Evaluations
    Route::apiResource('evaluations', EvaluationController::class);
    Route::get('students/{student}/evaluations', [EvaluationController::class, 'byStudent']);
    
    // Assessments
    Route::apiResource('assessments', AssessmentController::class);
    Route::get('students/{student}/assessments', [AssessmentController::class, 'byStudent']);
});
```

---

#### **FASE 8: Frontend Integration** (30 minutter)

**Step 8.1: Opdater API Config**

I `frontend/src/config/apiConfig.ts`:
```typescript
export const API_CONFIG = {
  mode: 'real' as const, // Skift fra 'static' til 'real'
  
  realApi: {
    baseUrl: 'http://localhost:8000/api',
    timeout: 10000,
    auth: {
      loginEndpoint: '/auth/login',
      logoutEndpoint: '/auth/logout',
      meEndpoint: '/auth/me',
      tokenKey: 'api_token',
    }
  },
  
  // ... behold mock/static config til development
}
```

**Step 8.2: Opdater API Service**

Sørg for at `src/services/api.ts` sender Authorization header:
```typescript
const token = localStorage.getItem('api_token');
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

---

#### **FASE 9: Testing & Deployment** (1-2 timer)

**Step 9.1: Lokal Test**
```bash
# Terminal 1: Start Laravel backend
cd StudentAdminAPI
php artisan serve
# Kører på: http://localhost:8000

# Terminal 2: Start React frontend
cd FrontEndTest
npm run dev
# Kører på: http://localhost:5173
```

**Step 9.2: Test API Endpoints**

Brug Postman eller cURL:
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aspiring.dk","password":"password123"}'

# Get students (med token)
curl -X GET http://localhost:8000/api/students \
  -H "Authorization: Bearer {din_token}"
```

**Step 9.3: Seed Database (optional)**
```bash
# Opret seeder med mock data
php artisan make:seeder StudentSeeder
php artisan make:seeder ClassSeeder

# Kør seeders
php artisan db:seed
```

---

### 📦 Deployment Overvejelser

**Production Setup:**
- ✅ Hosting: DigitalOcean, AWS, eller shared hosting med PHP/MySQL support
- ✅ Database: MySQL 8.0+ i production
- ✅ SSL Certificate: Let's Encrypt via Laravel Forge
- ✅ Environment: `.env` med production credentials
- ✅ Caching: Redis/Memcached for sessions og cache
- ✅ Queue: Laravel Queue for async tasks (exports, emails)

**Sikkerhed:**
- ✅ Rate limiting på API endpoints
- ✅ SQL injection protection (Eloquent ORM)
- ✅ XSS protection
- ✅ CSRF tokens
- ✅ API token expiration
- ✅ Input validation på alle requests

---

### 🎯 Prioriteret Implementation Order

1. **Week 1:** Setup + Students API (CRUD)
2. **Week 2:** Classes API + Enrollments
3. **Week 3:** Evaluations API (formativ + summativ)
4. **Week 4:** Assessments API (bedømmelser)
5. **Week 5:** Authentication + Security
6. **Week 6:** Testing + Bug fixes
7. **Future:** Attendance + Planning + Export features
