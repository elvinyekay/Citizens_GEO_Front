# Citizens GEO - README

## Layihə haqqında

Citizens GEO - vətəndaşların məlumatlarını idarə etmək və xəritədə coğrafi əraziləri (polygon) təyin etmək üçün full-stack web tətbiqi.

---

### Deploy Linklər
- [Backend Swagger (API Docs)](https://citizens-geo-api.onrender.com/swagger/index.html)
- [Frontend Demo (Vercel)](https://citizens-geo-front.vercel.app/)


## Texnologiyalar

### Backend
- .NET 8.0
- PostgreSQL + PostGIS
- Entity Framework Core
- AutoMapper
- Swagger

### Frontend
- Next.js 15
- TypeScript
- OpenLayers (xəritə)
- Tailwind CSS

---

## Backend Setup

### 1. Tələblər
- .NET 8.0 SDK
- PostgreSQL 15+

### 2. Database konfiqurasiyası

appsettings.json faylında connection string-i dəyişin:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=citizendb;Username=postgres;Password=yourpassword"
  }
}
```

### 3. Migration
```bash
cd Citizen_Geo_API
dotnet ef database update
```

### 4. İşə salın
```bash
dotnet run
```

API: http://localhost:5177
Swagger: http://localhost:5177/swagger

---

## Frontend Setup

### 1. Tələblər
- Node.js 18+
- npm

### 2. Paketləri yükləyin
```bash
cd Citizens_GEO_Front
npm install
```

### 3. Environment variables

.env.local faylı yaradın:
```
NEXT_PUBLIC_API_URL=http://localhost:5177/api
```

### 4. İşə salın
```bash
npm run dev
```

Frontend: http://localhost:3000

---

## API Endpoints

### Citizens
- GET /api/citizens - Bütün vətəndaşlar
- GET /api/citizens/{id} - Bir vətəndaş
- POST /api/citizens - Yeni vətəndaş
- PUT /api/citizens/{id} - Vətəndaş məlumatını yenilə
- DELETE /api/citizens/{id} - Vətəndaşı sil

### Polygons
- GET /api/polygons - Bütün polygon-lar
- POST /api/polygons - Yeni polygon
- DELETE /api/polygons/{id} - Polygon-u sil

---

## Xüsusiyyətlər

### Vətəndaş İdarəetməsi
- Vətəndaş əlavə et, düzəlt, sil
- Cədvəl görünüşü
- Axtarış və filtrlər

### Xəritə
- OpenLayers ilə interaktiv xəritə
- Polygon çəkmə
- Polygon-ları göstər/gizlət
- Polygon silmə

---

## Folder Strukturu

### Backend
```
Citizen_Geo_API/
├── Controllers/
├── Data/
├── DTOs/
├── Models/
├── Repositories/
├── Services/
├── Migrations/
└── Program.cs
```

### Frontend
```
Citizens_GEO_Front/
├── public/
└── src/
├── app/
│   ├── (admin)/
│   │   └── (others-pages)/
│   ├── (full-width-pages)/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   └── shared/
├── services/
│   ├── api/
│   ├── hooks/
│   └── mock/
├── types/
├── constants/
├── hooks/
├── utils/
├── styles/
└── lib/

```

---

## Müəllif

Elvin Yekayev

