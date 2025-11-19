# Documentación de la API - Akens Nordburg

## Descripción General

Sistema de gestión de reclutamiento que permite gestionar posiciones, procesos de selección, talentos y estadísticas. El sistema soporta múltiples roles: Admin, Recruiter (user), Client y Talent.

## Tecnologías

- **Backend**: Node.js, Express, TypeScript
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: JWT (JSON Web Tokens)
- **Logging**: Winston
- **Frontend**: Next.js, React, TypeScript

## Estructura del Proyecto

### Backend
- `src/controllers/` - Controladores de lógica de negocio
- `src/routes/` - Definición de rutas
- `src/middleware/` - Middlewares (autenticación)
- `src/services/` - Servicios (Prisma, Logger)
- `src/types/` - Tipos TypeScript
- `src/constants/` - Constantes y mensajes
- `src/scripts/initialize/` - Scripts de inicialización
- `prisma/` - Schema y migraciones de Prisma

### Frontend
- `pages/` - Páginas de Next.js
- `components/` - Componentes React
- `context/` - Context API (UserContext)
- `services/` - Servicios API
- `interfaces/` - Tipos TypeScript
- `hooks/` - Custom hooks

## Modelos de Base de Datos

### User
- `id`: Int (PK)
- `name`: String
- `email`: String (unique)
- `password`: String (hasheado)
- `rolId`: Int (FK a Rol)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Rol
- `id`: Int (PK)
- `description`: String (unique) - Valores: "admin", "user" (recruiter), "client", "talent"

### Position
- `id`: Int (PK)
- `title`: String
- `description`: String
- `requirements`: String[]
- `location`: String?
- `salaryMin`: Float?
- `salaryMax`: Float?
- `currency`: String? (default: "USD")
- `clientId`: Int (FK a User)
- `status`: String (default: "draft") - Valores: "draft", "published", "closed"
- `keywords`: String[]
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Process
- `id`: Int (PK)
- `title`: String
- `description`: String?
- `status`: String (default: "open") - Valores: "open", "in_progress", "closed", "cancelled"
- `positionId`: Int (FK a Position)
- `recruiterId`: Int (FK a User)
- `clientId`: Int (FK a User)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### ProcessStage
- `id`: Int (PK)
- `name`: String
- `order`: Int
- `processId`: Int (FK a Process)
- `createdAt`: DateTime

### ProcessCandidate
- `id`: Int (PK)
- `processId`: Int (FK a Process)
- `talentId`: Int (FK a User)
- `stageId`: Int (FK a ProcessStage)
- `status`: String (default: "pending") - Valores: "pending", "approved", "rejected", "in_review"
- `notes`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime

### TalentProfile
- `id`: Int (PK)
- `talentId`: Int (FK a User, unique)
- `keywords`: String[]
- `skills`: String[]
- `experience`: String?
- `education`: String?
- `updatedAt`: DateTime

### TalentCV
- `id`: Int (PK)
- `talentId`: Int (FK a User)
- `fileUrl`: String
- `fileName`: String
- `version`: Int (default: 1)
- `uploadedAt`: DateTime

### MonthlyGoal
- `id`: Int (PK)
- `month`: Int (1-12)
- `year`: Int
- `targetProcesses`: Int
- `targetHires`: Int
- `actualProcesses`: Int (default: 0)
- `actualHires`: Int (default: 0)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- Unique constraint: `[month, year]`

### AnnualGoal
- `id`: Int (PK)
- `year`: Int (unique)
- `targetProcesses`: Int
- `targetHires`: Int
- `actualProcesses`: Int (default: 0)
- `actualHires`: Int (default: 0)
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Endpoints de la API

### Autenticación

#### POST `/api/auth/login`
Inicia sesión de usuario.

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "user": {
    "id": number,
    "name": "string",
    "email": "string",
    "role": "string",
    "createdAt": "string"
  }
}
```

#### POST `/api/auth/register`
Registra un nuevo usuario.

**Body:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string",
  "rolId": number
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": number,
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

---

### Usuarios

#### GET `/api/user`
Obtiene todos los usuarios. Requiere autenticación.

**Response:**
```json
[
  {
    "id": number,
    "name": "string",
    "email": "string",
    "role": "string",
    "createdAt": "string"
  }
]
```

#### GET `/api/user/:id`
Obtiene un usuario por ID. Requiere autenticación.

**Response:**
```json
{
  "id": number,
  "name": "string",
  "email": "string",
  "role": "string",
  "createdAt": "string"
}
```

#### POST `/api/user`
Crea un nuevo usuario. Requiere autenticación.

**Body:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string",
  "rol": "string"
}
```

#### PUT `/api/user`
Actualiza un usuario. Requiere autenticación.

**Body:**
```json
{
  "name": "string",
  "email": "string",
  "rolId": number
}
```

#### DELETE `/api/user/:id`
Elimina un usuario. Requiere autenticación.

#### POST `/api/user/rol/`
Obtiene usuarios por rol. Requiere autenticación.

**Body:**
```json
{
  "rol": "string"
}
```

---

### Roles

#### GET `/api/roles`
Obtiene todos los roles. Requiere autenticación.

---

### Posiciones

#### GET `/api/positions`
Obtiene todas las posiciones con filtros opcionales. Requiere autenticación.

**Query Parameters:**
- `clientId`: number (opcional)
- `status`: string (opcional) - Valores: "draft", "published", "closed"

**Response:**
```json
[
  {
    "id": number,
    "title": "string",
    "description": "string",
    "requirements": ["string"],
    "location": "string",
    "salaryMin": number,
    "salaryMax": number,
    "currency": "string",
    "status": "string",
    "keywords": ["string"],
    "client": {
      "id": number,
      "name": "string",
      "email": "string"
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

#### GET `/api/positions/:id`
Obtiene una posición por ID. Requiere autenticación.

**Response:**
```json
{
  "id": number,
  "title": "string",
  "description": "string",
  "requirements": ["string"],
  "location": "string",
  "salaryMin": number,
  "salaryMax": number,
  "currency": "string",
  "status": "string",
  "keywords": ["string"],
  "client": {
    "id": number,
    "name": "string",
    "email": "string"
  },
  "processes": [
    {
      "id": number,
      "title": "string",
      "recruiter": {
        "id": number,
        "name": "string",
        "email": "string"
      }
    }
  ],
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### POST `/api/positions`
Crea una nueva posición. Requiere autenticación.

**Body:**
```json
{
  "title": "string",
  "description": "string",
  "requirements": ["string"],
  "location": "string",
  "salaryMin": number,
  "salaryMax": number,
  "currency": "string",
  "keywords": ["string"],
  "status": "string",
  "clientId": number
}
```

#### PUT `/api/positions/:id`
Actualiza una posición. Requiere autenticación.

**Body:**
```json
{
  "title": "string",
  "description": "string",
  "requirements": ["string"],
  "location": "string",
  "salaryMin": number,
  "salaryMax": number,
  "currency": "string",
  "status": "string",
  "keywords": ["string"]
}
```

#### DELETE `/api/positions/:id`
Elimina una posición. Requiere autenticación.

---

### Procesos

#### GET `/api/processes`
Obtiene todos los procesos con filtros opcionales. Requiere autenticación.

**Query Parameters:**
- `clientId`: number (opcional)
- `recruiterId`: number (opcional)
- `status`: string (opcional)
- `positionId`: number (opcional)
- `talentId`: number (opcional) - Filtra procesos donde el talento es candidato

**Response:**
```json
[
  {
    "id": number,
    "title": "string",
    "description": "string",
    "status": "string",
    "position": {
      "id": number,
      "title": "string",
      "client": {
        "id": number,
        "name": "string",
        "email": "string"
      }
    },
    "recruiter": {
      "id": number,
      "name": "string",
      "email": "string"
    },
    "client": {
      "id": number,
      "name": "string",
      "email": "string"
    },
    "stages": [
      {
        "id": number,
        "name": "string",
        "order": number,
        "candidates": [
          {
            "id": number,
            "talent": {
              "id": number,
              "name": "string",
              "email": "string"
            }
          }
        ]
      }
    ],
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

#### GET `/api/processes/:id`
Obtiene un proceso por ID con toda su información. Requiere autenticación.

**Response:**
```json
{
  "id": number,
  "title": "string",
  "description": "string",
  "status": "string",
  "position": {...},
  "recruiter": {...},
  "client": {...},
  "stages": [...],
  "candidates": [
    {
      "id": number,
      "talent": {...},
      "stage": {...},
      "status": "string",
      "notes": "string"
    }
  ],
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### POST `/api/processes`
Crea un nuevo proceso. Requiere autenticación.

**Body:**
```json
{
  "title": "string",
  "description": "string",
  "status": "string",
  "positionId": number,
  "recruiterId": number,
  "clientId": number,
  "stages": [
    {
      "name": "string",
      "order": number
    }
  ]
}
```

#### PUT `/api/processes/:id`
Actualiza un proceso. Requiere autenticación.

**Body:**
```json
{
  "title": "string",
  "description": "string",
  "status": "string",
  "positionId": number,
  "recruiterId": number,
  "clientId": number
}
```

#### DELETE `/api/processes/:id`
Elimina un proceso. Requiere autenticación.

#### POST `/api/processes/:id/stages`
Agrega una etapa a un proceso. Requiere autenticación.

**Body:**
```json
{
  "name": "string",
  "order": number
}
```

#### POST `/api/processes/:id/candidates`
Agrega un candidato a un proceso. Requiere autenticación.

**Body:**
```json
{
  "talentId": number,
  "stageId": number,
  "status": "string",
  "notes": "string"
}
```

#### PUT `/api/processes/:id/candidates/:candidateId`
Actualiza un candidato en un proceso. Requiere autenticación.

**Body:**
```json
{
  "stageId": number,
  "status": "string",
  "notes": "string"
}
```

#### DELETE `/api/processes/:id/candidates/:candidateId`
Elimina un candidato de un proceso. Requiere autenticación.

---

### Talentos

#### GET `/api/talents/:id/profile`
Obtiene el perfil de un talento. Requiere autenticación.

**Response:**
```json
{
  "id": number,
  "talentId": number,
  "keywords": ["string"],
  "skills": ["string"],
  "experience": "string",
  "education": "string",
  "talent": {
    "id": number,
    "name": "string",
    "email": "string"
  },
  "cv": {
    "id": number,
    "fileUrl": "string",
    "fileName": "string",
    "version": number,
    "uploadedAt": "string"
  },
  "updatedAt": "string"
}
```

#### PUT `/api/talents/:id/profile`
Crea o actualiza el perfil de un talento. Requiere autenticación (solo el propio talento).

**Body:**
```json
{
  "keywords": ["string"],
  "skills": ["string"],
  "experience": "string",
  "education": "string"
}
```

#### GET `/api/talents/:id/cvs`
Obtiene todos los CVs de un talento. Requiere autenticación.

**Response:**
```json
[
  {
    "id": number,
    "talentId": number,
    "fileUrl": "string",
    "fileName": "string",
    "version": number,
    "uploadedAt": "string"
  }
]
```

#### POST `/api/talents/:id/cvs`
Sube un nuevo CV para un talento. Requiere autenticación (solo el propio talento).

**Body:**
```json
{
  "fileUrl": "string",
  "fileName": "string"
}
```

#### DELETE `/api/talents/:id/cvs/:cvId`
Elimina un CV. Requiere autenticación (solo el propio talento).

---

### Estadísticas

#### GET `/api/stats/admin`
Obtiene estadísticas para el dashboard de administrador. Requiere autenticación.

**Response:**
```json
{
  "processStats": {
    "total": number,
    "open": number,
    "inProgress": number,
    "closed": number,
    "cancelled": number
  },
  "recruiterStats": [
    {
      "recruiterId": number,
      "recruiterName": "string",
      "openProcesses": number,
      "closedProcesses": number,
      "totalProcesses": number
    }
  ],
  "monthlyGoals": [
    {
      "id": number,
      "month": number,
      "year": number,
      "targetProcesses": number,
      "targetHires": number,
      "actualProcesses": number,
      "actualHires": number
    }
  ],
  "annualGoals": [
    {
      "id": number,
      "year": number,
      "targetProcesses": number,
      "targetHires": number,
      "actualProcesses": number,
      "actualHires": number
    }
  ],
  "topRecruiters": [...],
  "recentProcesses": [...]
}
```

#### GET `/api/stats/recruiter`
Obtiene estadísticas para el dashboard de reclutador. Requiere autenticación.

**Response:**
```json
{
  "total": number,
  "open": number,
  "inProgress": number,
  "closed": number,
  "cancelled": number
}
```

#### GET `/api/stats/client`
Obtiene estadísticas para el dashboard de cliente. Requiere autenticación.

**Response:**
```json
{
  "positions": {
    "total": number,
    "draft": number,
    "published": number,
    "closed": number
  },
  "processes": {
    "total": number,
    "open": number,
    "inProgress": number,
    "closed": number,
    "cancelled": number
  }
}
```

#### POST `/api/stats/goals/monthly`
Crea o actualiza una meta mensual. Requiere autenticación.

**Body:**
```json
{
  "month": number,
  "year": number,
  "targetProcesses": number,
  "targetHires": number
}
```

#### POST `/api/stats/goals/annual`
Crea o actualiza una meta anual. Requiere autenticación.

**Body:**
```json
{
  "year": number,
  "targetProcesses": number,
  "targetHires": number
}
```

---

## Autenticación

Todos los endpoints (excepto `/api/auth/login` y `/api/auth/register`) requieren autenticación mediante JWT.

**Header requerido:**
```
Authorization: Bearer <token>
```

El token se obtiene del endpoint `/api/auth/login` y tiene una validez de 1 hora.

---

## Logging

El sistema utiliza Winston para logging. Los logs se guardan en:
- `logs/combined.log` - Todos los logs
- `logs/error.log` - Solo errores
- `logs/exceptions.log` - Excepciones no manejadas

Los logs incluyen:
- Operaciones exitosas (info)
- Errores (error)
- Advertencias (warn)
- Información de debug (debug)

---

## Usuarios de Prueba

El sistema crea automáticamente usuarios de prueba en la primera inicialización:

- **Admin**: `admin@test.com` / `admin123`
- **Recruiter**: `recruiter@test.com` / `recruiter123`
- **Client**: `client@test.com` / `client123`
- **Talent**: `talent@test.com` / `talent123`

Y usuarios adicionales:
- `recruiter2@test.com` / `recruiter123`
- `client2@test.com` / `client123`
- `talent2@test.com` / `talent123`
- `talent3@test.com` / `talent123`

---

## Códigos de Estado HTTP

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Variables de Entorno

**Backend (.env):**
- `PORT` - Puerto del servidor (default: 3000)
- `DATABASE_URL` - URL de conexión a PostgreSQL
- `JWT_SECRET` - Secret para firmar tokens JWT
- `FE_URL` - URL del frontend para CORS

**Frontend (.env.local):**
- `NEXT_PUBLIC_API_URL` - URL del backend API

