# Resumen del Proyecto - Akens Nordburg

## Descripción General

Sistema completo de gestión de reclutamiento y selección de personal que permite a diferentes tipos de usuarios (administradores, reclutadores, clientes y talentos) gestionar todo el ciclo de vida de los procesos de contratación.

## Funcionalidades Principales

### 1. Gestión de Usuarios y Autenticación
- Sistema de autenticación con JWT
- Registro e inicio de sesión de usuarios
- Gestión de usuarios con diferentes roles
- Control de acceso basado en roles

**Roles del Sistema:**
- **Admin**: Acceso completo al sistema, estadísticas globales
- **Recruiter (user)**: Gestiona procesos de reclutamiento
- **Client**: Publica posiciones y gestiona sus procesos
- **Talent**: Crea perfil, sube CV y participa en procesos

### 2. Gestión de Posiciones
- Crear, editar y eliminar posiciones de trabajo
- Estados: draft, published, closed
- Campos: título, descripción, requisitos, ubicación, rango salarial, palabras clave
- Filtrado por cliente y estado
- Relación con procesos de reclutamiento

### 3. Gestión de Procesos de Reclutamiento
- Crear procesos asociados a posiciones
- Estados: open, in_progress, closed, cancelled
- Gestión de etapas del proceso (ProcessStages)
- Agregar candidatos a procesos
- Mover candidatos entre etapas
- Actualizar estado de candidatos (pending, approved, rejected, in_review)
- Agregar notas a candidatos
- Filtrado por cliente, reclutador, posición o talento

### 4. Gestión de Perfiles de Talentos
- Crear y actualizar perfil profesional
- Palabras clave para búsqueda
- Habilidades y competencias
- Experiencia y educación
- Subir y gestionar CVs (múltiples versiones)
- Control de acceso: solo el propio talento puede modificar su perfil

### 5. Sistema de Estadísticas y Dashboards

#### Dashboard de Administrador
- Estadísticas generales de procesos (total, abiertos, en progreso, cerrados, cancelados)
- Estadísticas por reclutador
- Top 5 reclutadores
- Metas mensuales y anuales
- Procesos recientes

#### Dashboard de Reclutador
- Estadísticas de sus procesos
- Total, abiertos, en progreso, cerrados, cancelados

#### Dashboard de Cliente
- Estadísticas de posiciones (total, borradores, publicadas, cerradas)
- Estadísticas de procesos (total, abiertos, en progreso, cerrados, cancelados)

#### Dashboard de Talento
- Perfil del talento
- CV subido
- Procesos activos en los que participa
- Palabras clave y habilidades

### 6. Sistema de Metas
- Metas mensuales (procesos objetivo, contrataciones objetivo)
- Metas anuales (procesos objetivo, contrataciones objetivo)
- Seguimiento de progreso (actual vs objetivo)

### 7. Sistema de Logging
- Logging completo de todas las operaciones
- Niveles: info, warn, error, debug
- Logs guardados en archivos:
  - `logs/combined.log` - Todos los logs
  - `logs/error.log` - Solo errores
  - `logs/exceptions.log` - Excepciones no manejadas
- Información registrada:
  - Operaciones exitosas con contexto
  - Errores con detalles
  - Intentos de acceso no autorizados
  - Verificación de tokens

### 8. Sistema de Mensajes
- Mensajes centralizados para respuestas de API
- Categorías: USER, AUTH, POSITION, PROCESS, TALENT, STATS, GENERAL
- Mensajes de éxito y error consistentes

## Endpoints Completos

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### Usuarios
- `GET /api/user` - Listar todos los usuarios
- `GET /api/user/:id` - Obtener usuario por ID
- `POST /api/user` - Crear usuario
- `PUT /api/user` - Actualizar usuario
- `DELETE /api/user/:id` - Eliminar usuario
- `POST /api/user/rol/` - Obtener usuarios por rol

### Roles
- `GET /api/roles` - Listar todos los roles

### Posiciones
- `GET /api/positions` - Listar posiciones (con filtros: clientId, status)
- `GET /api/positions/:id` - Obtener posición por ID
- `POST /api/positions` - Crear posición
- `PUT /api/positions/:id` - Actualizar posición
- `DELETE /api/positions/:id` - Eliminar posición

### Procesos
- `GET /api/processes` - Listar procesos (con filtros: clientId, recruiterId, status, positionId, talentId)
- `GET /api/processes/:id` - Obtener proceso por ID
- `POST /api/processes` - Crear proceso
- `PUT /api/processes/:id` - Actualizar proceso
- `DELETE /api/processes/:id` - Eliminar proceso
- `POST /api/processes/:id/stages` - Agregar etapa a proceso
- `POST /api/processes/:id/candidates` - Agregar candidato a proceso
- `PUT /api/processes/:id/candidates/:candidateId` - Actualizar candidato
- `DELETE /api/processes/:id/candidates/:candidateId` - Eliminar candidato de proceso

### Talentos
- `GET /api/talents/:id/profile` - Obtener perfil de talento
- `PUT /api/talents/:id/profile` - Crear/actualizar perfil de talento
- `GET /api/talents/:id/cvs` - Listar CVs de talento
- `POST /api/talents/:id/cvs` - Subir CV
- `DELETE /api/talents/:id/cvs/:cvId` - Eliminar CV

### Estadísticas
- `GET /api/stats/admin` - Estadísticas para admin
- `GET /api/stats/recruiter` - Estadísticas para reclutador
- `GET /api/stats/client` - Estadísticas para cliente
- `POST /api/stats/goals/monthly` - Crear/actualizar meta mensual
- `POST /api/stats/goals/annual` - Crear/actualizar meta anual

## Flujos de Trabajo

### Flujo Cliente
1. Cliente crea una posición (draft)
2. Cliente publica la posición (published)
3. Reclutador crea un proceso asociado a la posición
4. Reclutador agrega etapas al proceso
5. Reclutador agrega candidatos (talentos) al proceso
6. Reclutador mueve candidatos entre etapas
7. Reclutador actualiza estado de candidatos
8. Proceso se cierra cuando se contrata o se cancela

### Flujo Talento
1. Talento se registra en el sistema
2. Talento completa su perfil (keywords, skills, experience, education)
3. Talento sube su CV
4. Talento es agregado a procesos por reclutadores
5. Talento puede ver sus procesos activos
6. Talento actualiza su perfil y CV según sea necesario

### Flujo Reclutador
1. Reclutador ve posiciones publicadas
2. Reclutador crea proceso para una posición
3. Reclutador define etapas del proceso
4. Reclutador busca talentos y los agrega al proceso
5. Reclutador gestiona el avance de candidatos
6. Reclutador actualiza estados y notas
7. Reclutador cierra procesos

### Flujo Administrador
1. Administrador ve estadísticas globales
2. Administrador configura metas mensuales/anuales
3. Administrador monitorea performance de reclutadores
4. Administrador gestiona usuarios del sistema
5. Administrador revisa procesos recientes

## Seguridad

- Autenticación JWT con expiración de 1 hora
- Passwords hasheados con bcrypt (12 rounds)
- Middleware de autenticación en todas las rutas protegidas
- Validación de permisos (talento solo puede modificar su propio perfil)
- Logging de intentos de acceso no autorizados
- CORS configurado para el frontend

## Base de Datos

- PostgreSQL como base de datos principal
- Prisma ORM para gestión de base de datos
- Migraciones automáticas
- Relaciones bien definidas entre entidades
- Constraints de integridad referencial
- Cascade deletes donde corresponde

## Inicialización

El sistema se inicializa automáticamente en el primer arranque:
1. Crea roles base (admin, user, client, talent)
2. Crea usuarios de prueba para cada rol
3. Marca la base de datos como inicializada

## Logging y Monitoreo

Todos los procesos están logueados:
- Operaciones exitosas con contexto relevante
- Errores con stack traces
- Advertencias para situaciones inusuales
- Información de autenticación
- Métricas de uso (conteos, filtros aplicados)

Los logs se pueden revisar en tiempo real o consultar los archivos de log para análisis histórico.

