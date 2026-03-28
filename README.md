# G-Shield Code

Plataforma Full Stack para la Evaluación y Ejecución Segura de Fragmentos de Código No Confiables en Entornos Aislados

> Proyecto de Especialidad - Arquitectura y Desarrollo Avanzado de Software<br>
> Maestría en Full Stack Development - Universidad Católica Boliviana "San Pablo"

---

## Descripción

**G-Shield Code** es una plataforma integral full stack diseñada para la evaluación automatizada y la ejecución segura de fragmentos de código potencialmente no confiables en entornos aislados.
El sistema articula dos dimensiones críticas: la necesidad pedagógica de proveer mecanismos de evaluación eficientes en la enseñanza de la programación, y la exigencia técnica de garantizar un marco de ejecución que preserve la seguridad e integridad del servidor anfitrión.

---

## Objetivo General

Diseñar y desarrollar una plataforma full stack con arquitectura modular que permita la ejecución segura de fragmentos de código no confiables en entornos aislados, proporcionando evaluación y retroalimentación automatizada para la enseñanza de la programación y la evaluación de pruebas técnicas.

---

## Objetivos Específicos

- **OE1 - Arquitectura Modular:** Definir una estructura de monolito modular que desacople la lógica de orquestación del entorno de ejecución con el propósito de facilitar el mantenimiento, la extensibilidad y la futura escalabilidad de la plataforma.
- **OE2 - Interfaz y API:** Desarrollar una interfaz web responsiva y una API robusta que permitan la comunicación asíncrona con los usuarios, proporcionando retroalimentación inmediata y confiable sobre sus envíos de código.
- **OE3 - Sandbox Seguro:** Diseñar un sandbox orquestado mediante Docker, capaz de ejecutar código en Python bajo un marco de seguridad multicapa que incluya límites estrictos de recursos, aislamiento de ref y filtrado de llamadas al sistema, garantizando la integridad del servidor.
- **OE4 - Suite de Pruebas:** Desarrollar un conjunto de pruebas integrales que abarquen pruebas unitarias, de integración y de penetración de seguridad, con el fin de validar la robustez, confiabilidad y resiliencia de la plataforma frente a posibles vulnerabilidades.

---

## Alcance

Pendiente por completar

---

## Stack Tecnológico

### Frontend

| Tecnología   | Rol                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------- |
| React        | Biblioteca para construcción de interfaces de usuario mediante componentes declarativos. |
| Vite         | Bundler y servidor de desarrollo de alta velocidad.                                      |
| TypeScript   | Tipado estático para mayor robustez y mantenibilidad del código.                         |
| Tailwind CSS | Framework de estilos utilitarios para interfaces responsivas.                            |

### Backend

| Tecnología | Rol                                                                                 |
| ---------- | ----------------------------------------------------------------------------------- |
| Node.js    | Entorno de ejecución del lado del servidor, modelo asíncrono orientado a eventos.   |
| Express    | Framework web minimalista para definición de rutas, middlewares y controladores.    |
| TypeScript | Tipado estático aplicado en toda la capa de negocio para mayor robustez.            |
| Prisma ORM | Capa de abstracción para el acceso a la base de datos con migraciones declarativas. |
| BullMQ     | Sistema de colas de trabajo sobre Redis para desacoplar envíos de su ejecución      |
| Socket.IO  | Implementación de comunicación bidireccional via WebSocket.                         |

### Base de Datos

| Tecnología | Rol                                                               |
| ---------- | ----------------------------------------------------------------- |
| PostgreSQL | Sistema de gestión de bases de datos objeto relacional principal. |
| Redis      | Broker de mensajería para BullMQ y capa de caché                  |

### Infraestructura

| Tecnología     | Rol                                                              |
| -------------- | ---------------------------------------------------------------- |
| Docker         | Plataforma de contenedores para el sandbox de ejecución aislada. |
| Docker Compose | Orquestación local de todos los servicios del sistema.           |

### Testing

| Tecnología | Rol                                      |
| ---------- | ---------------------------------------- |
| Jest       | Pruebas unitarias                        |
| Playwright | Pruebas end-to-end de flujos de usuarios |

---

## Arquitectura

G-Shield Code es un **monolito modular** estructurado como un monorepo `pnpm` con dos aplicaciones: `@app/frontend` (React + Vite) y `@app/backend` (Express + Worker). Comparten configuración TypeScript y herramientas desde la raíz.

### Estructura del backend

El backend se organiza en **módulos de funcionalidad** autocontenidos. Cada módulo posee todas sus capas en una sola carpeta siguiendo la convención `{módulo}.{capa}.ts`:

| Módulo       | Responsabilidad                                                         |
| ------------ | ----------------------------------------------------------------------- |
| `auth`       | Registro, autenticacion, JWT y refresh token rotation                   |
| `problem`    | Gestion de problemas y casos de prueba                                  |
| `submission` | Envio de codigo, evaluacion mediante Docker y resultados en tiempo real |

Cada módulo expone únicamente su `index.ts` como API pública. Ningun módulo importa archivos internos de otro.

### Patrones de diseño

| Patron     | Proposito                                                                          |
| ---------- | ---------------------------------------------------------------------------------- |
| Repository | Desacopla la logica de negocio de Prisma. Interfaz intercambiable por test doubles |
| Service    | Centraliza la logica de negocio con inyeccion de dependencias                      |
| Strategy   | Encapsula la logica de evaluacion por lenguaje (`PythonEvaluationStrategy`)        |
| Result     | Convierte errores de dominio esperados en valores tipados, sin `throw`             |

### Flujo de evaluacion

```mermaid
sequenceDiagram
  participant FE as Frontend
  participant API as Backend API
  participant Q as Redis / BullMQ
  participant W as Worker
  participant D as Docker Sandbox
  participant WS as Socket.IO

  FE->>API: POST /api/submissions
  API->>Q: Encolar trabajo de evaluacion
  API-->>FE: HTTP 202 Accepted

  FE->>WS: Suscribirse al room de la submission
  Q->>W: Desencolar trabajo
  W->>D: Ejecutar codigo por caso de prueba
  D-->>W: Resultado (stdout, exitCode, tiempo, memoria)
  W->>WS: Emitir eventos de progreso y resultado
  WS-->>FE: submission:update en tiempo real
```

> Para la documentacion completa de la arquitectura, patrones y diagramas de la arquitectura, ver [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md).

---

## Endpoints

Base URL: `http://localhost:3000`

### Utilidad

| Método | Ruta      | Auth | Descripcion              |
| ------ | --------- | :--: | ------------------------ |
| `GET`  | `/health` |  No  | Estado del servidor y DB |

### Autenticacion (`/api/auth`)

| Método | Ruta                      | Auth | Descripcion                                        |
| ------ | ------------------------- | :--: | -------------------------------------------------- |
| `POST` | `/api/auth/signup`        |  No  | Registrar nuevo usuario                            |
| `POST` | `/api/auth/signin`        |  No  | Iniciar sesion, retorna access token               |
| `POST` | `/api/auth/refresh-token` |  No  | Renovar access token usando refresh token (cookie) |
| `POST` | `/api/auth/signout`       |  No  | Cerrar sesion, invalida el refresh token           |

### Problemas (`/api/problems`)

| Método   | Ruta                | Auth | Rol requerido | Descripcion                |
| -------- | ------------------- | :--: | ------------- | -------------------------- |
| `GET`    | `/api/problems`     |  Si  | Cualquiera    | Listar todos los problemas |
| `GET`    | `/api/problems/:id` |  Si  | Cualquiera    | Obtener problema por ID    |
| `POST`   | `/api/problems`     |  Si  | `EVALUATOR`   | Crear problema             |
| `PATCH`  | `/api/problems/:id` |  Si  | `EVALUATOR`   | Actualizar problema        |
| `DELETE` | `/api/problems/:id` |  Si  | `EVALUATOR`   | Eliminar problema          |

### Casos de Prueba (`/api/problems/:problemId/test-cases`)

> Los usuarios con rol `CODER` solo reciben casos de prueba marcados como muestra.

| Método   | Ruta                                      | Auth | Rol requerido | Descripcion                   |
| -------- | ----------------------------------------- | :--: | ------------- | ----------------------------- |
| `GET`    | `/api/problems/:problemId/test-cases`     |  Si  | Cualquiera    | Listar casos de prueba        |
| `GET`    | `/api/problems/:problemId/test-cases/:id` |  Si  | Cualquiera    | Obtener caso de prueba por ID |
| `POST`   | `/api/problems/:problemId/test-cases`     |  Si  | `EVALUATOR`   | Crear caso de prueba          |
| `PATCH`  | `/api/problems/:problemId/test-cases/:id` |  Si  | `EVALUATOR`   | Actualizar caso de prueba     |
| `DELETE` | `/api/problems/:problemId/test-cases/:id` |  Si  | `EVALUATOR`   | Eliminar caso de prueba       |

### Envios (`/api/submissions`)

| Método | Ruta                   | Auth | Rol requerido | Descripcion                     |
| ------ | ---------------------- | :--: | ------------- | ------------------------------- |
| `POST` | `/api/submissions`     |  Si  | `CODER`       | Enviar solución para evaluación |
| `GET`  | `/api/submissions`     |  Si  | Cualquiera    | Listar envios                   |
| `GET`  | `/api/submissions/:id` |  Si  | Cualquiera    | Obtener envio por ID            |

---

## Cómo Ejecutar el Proyecto

### Prerequisitos

- [Docker](https://docs.docker.com/get-started/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/en/download) >= 20.x LTS
- [pnpm](https://pnpm.io/installation) >= 10.x
- Docker Engine en ejecucion (requerido para contenedores de evaluacion)

### 1. Clonar el repositorio

```bash
git clone https://github.com/GChavezM/code-evaluation-platform.git
cd code-evaluation-platform
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

Editar los valores en cada archivo. Ver la sección [Variables de Entorno](#variables-de-entorno) para la referencia completa.

### 4. Levantar infraestructura (PostgreSQL + Redis)

```bash
docker compose up -d postgres redis
```

Opcional (validar contenedores):

```bash
docker compose ps
```

### 5. Ejecutar migraciones de base de datos

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 6. Iniciar el entorno de desarrollo

Iniciar frontend y backend en paralelo:

```bash
pnpm dev
```

Servicios esperados:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

Opcional (ejecucion por separado):

```bash
pnpm dev:frontend
pnpm dev:backend
```

### 7. Levantar el sistema completo con Docker Compose

Actualmente `compose.yaml` levanta servicios de infraestructura (PostgreSQL y Redis).
El backend, frontend y worker se ejecutan en modo desarrollo con `pnpm dev`.

### 8. Scripts disponibles

| Script              | Descripcion                                             |
| ------------------- | ------------------------------------------------------- |
| `pnpm dev`          | Inicia frontend y backend en modo desarrollo            |
| `pnpm dev:frontend` | Inicia solo frontend (Vite)                             |
| `pnpm dev:backend`  | Inicia solo backend (Express + worker integrado)        |
| `pnpm build`        | Compila todos los paquetes                              |
| `pnpm typecheck`    | Ejecuta validacion de tipos en todo el monorepo         |
| `pnpm lint`         | Ejecuta ESLint                                          |
| `pnpm format`       | Formatea el codigo con Prettier                         |
| `pnpm db:generate`  | Regenera Prisma Client                                  |
| `pnpm db:migrate`   | Aplica migraciones de Prisma en desarrollo              |
| `pnpm db:seed`      | Ejecuta el seed de base de datos                        |
| `pnpm db:reset`     | Reinicia la base de datos y reaplica migraciones + seed |
| `pnpm db:studio`    | Abre Prisma Studio                                      |

### 9. Apagado y limpieza

Detener infraestructura:

```bash
docker compose down
```

Detener y eliminar volumenes (reinicio limpio de datos locales):

```bash
docker compose down -v
```

---

## Variables de Entorno

### Backend (`apps/backend/.env`)

| Variable                 | Requerida | Descripcion                            | Valor por defecto / ejemplo                                              |
| ------------------------ | :-------: | -------------------------------------- | ------------------------------------------------------------------------ |
| `NODE_ENV`               |    No     | Entorno de ejecucion                   | `development`                                                            |
| `PORT`                   |    No     | Puerto del servidor Express            | `3000`                                                                   |
| `DATABASE_URL`           |    Si     | URL de conexion a PostgreSQL           | `postgresql://postgres:postgres@localhost:5432/code_evaluation_platform` |
| `REDIS_URL`              |    Si     | URL de conexion a Redis                | `redis://localhost:6379`                                                 |
| `JWT_ACCESS_SECRET`      |    Si     | Secreto para firmar los access tokens  | Cadena aleatoria larga — ver comando abajo                               |
| `JWT_REFRESH_SECRET`     |    Si     | Secreto para firmar los refresh tokens | Cadena aleatoria larga (diferente al anterior)                           |
| `JWT_ACCESS_EXPIRES_IN`  |    No     | Duracion del access token en segundos  | `900` (15 minutos)                                                       |
| `JWT_REFRESH_EXPIRES_IN` |    No     | Duracion del refresh token en segundos | `604800` (7 dias)                                                        |
| `FRONTEND_URL`           |    Si     | Origen del frontend permitido por CORS | `http://localhost:5173`                                                  |

### Frontend (`apps/frontend/.env`)

| Variable       | Requerida | Descripcion                                   | Valor por defecto / ejemplo |
| -------------- | :-------: | --------------------------------------------- | --------------------------- |
| `VITE_API_URL` |    Si     | URL base del backend consumida por el cliente | `http://localhost:3000`     |

### Generar secretos seguros

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Ejecutar dos veces: una para `JWT_ACCESS_SECRET` y otra para `JWT_REFRESH_SECRET`. Usar siempre valores distintos.

---

## Equipo y Roles

| Nombre         | Rol                  | Email                       |
| -------------- | -------------------- | --------------------------- |
| Gabriel Chávez | Full Stack Developer | <gchavezmardonez@gmail.com> |
