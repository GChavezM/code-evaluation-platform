# G-Shield Code — Architecture

> **Version:** 0.1.0
> **Last updated:** 2025-03-19
> **Author:** Gabriel Chávez

---

## Table of Contents

1. [Overview](#1-overview)
2. [Repository Structure](#2-repository-structure)
3. [System Diagram](#3-system-diagram)
4. [Backend Architecture](#4-backend-architecture)
   - 4.1 [Modular Structure](#41-modular-structure)
   - 4.2 [Module Anatomy](#42-module-anatomy)
   - 4.3 [Layer Responsibilities](#43-layer-responsibilities)
   - 4.4 [Layer Communication Rules](#44-layer-communication-rules)
   - 4.5 [Shared Kernel](#45-shared-kernel)
5. [Design Patterns](#5-design-patterns)
   - 5.1 [Repository Pattern](#51-repository-pattern)
   - 5.2 [Service Pattern](#52-service-pattern)
   - 5.3 [Strategy Pattern](#53-strategy-pattern)
   - 5.4 [Result Pattern](#54-result-pattern)
   - 5.5 [Patterns Working Together](#55-patterns-working-together)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Data Flow — Code Submission](#7-data-flow--code-submission)
8. [Error Handling Strategy](#8-error-handling-strategy)
9. [Tech Stack Reference](#9-tech-stack-reference)

---

## 1. Overview

**G-Shield Code** is a **modular monolith** full-stack platform for the secure
evaluation of untrusted code in isolated Docker sandboxes. The system is
structured as a **pnpm monorepo** with two applications (`@app/frontend`,
`@app/backend`) that share TypeScript configuration and tooling.

The backend is divided into **self-contained feature modules** (e.g. `auth`,
`submission`, `user`). Each module owns all of its layers co-located in a
single folder, following a consistent `{module}.{layer}.ts` naming convention.
Cross-module communication happens exclusively through each module's public
`index.ts` — never by importing internal layer files from another module.

---

## 2. Repository Structure

```
/
├── apps/
│   ├── frontend/                  # @app/frontend — React + Vite SPA
│   │   ├── src/
│   │   │   ├── features/          # Feature-scoped components and hooks
│   │   │   ├── api/               # All HTTP/WS calls (no fetch in components)
│   │   │   ├── components/        # Shared UI primitives
│   │   │   └── lib/               # Frontend utilities
│   │   ├── public/
│   │   ├── index.html
│   │   └── vite.config.ts
│   │
│   └── backend/                   # @app/backend — Express API + Worker
│       └── src/
│           ├── modules/           # ← Feature modules (core of the monolith)
│           │   ├── auth/
│           │   ├── submission/
│           │   └── user/
│           ├── queues/            # BullMQ job producers
│           ├── workers/           # BullMQ job consumers
│           ├── lib/               # Shared kernel (Result, errors, logger)
│           ├── config/            # Zod-validated environment configuration
│           ├── app.ts             # Express app assembly
│           └── server.ts          # HTTP server entry point
│
├── libs/                          # Future shared packages (types, utils)
├── docs/
│   ├── architecture/              # Architecture Guidelines
│   └── decisions/                 # Architecture Decision Records (ADRs)
├── tsconfig.base.json             # Root strict TS config (extended by all apps)
├── pnpm-workspace.yaml
├── eslint.config.mts
├── .prettierrc
└── package.json
```

---

## 3. System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          Browser                            │
│                  React + Vite + TailwindCSS                 │
└────────────────────────────┬────────────────────────────────┘
                             │ REST / WebSocket (Socket.IO)
┌────────────────────────────▼────────────────────────────────┐
│                    Express HTTP Server                      │
│  ┌──────────┐  ┌─────────────┐  ┌──────────────────────┐   │
│  │  Routes  │→ │ Controllers │→ │      Services        │   │
│  └──────────┘  └──────┬──────┘  │  (Strategy + Result) │   │
│                        │        └──────────┬─────────────┘  │
│                 ┌──────▼──────┐            │               │
│                 │  Validation │   ┌────────┴────────┐      │
│                 │   (Zod)     │   │                 │      │
│                 └─────────────┘   │                 │      │
│                            ┌──────▼──────┐  ┌───────▼────┐ │
│                            │Repositories │  │BullMQ Queue│ │
│                            │  (Prisma)   │  │(Producers) │ │
│                            └──────┬──────┘  └──────┬─────┘ │
└───────────────────────────────────┼────────────────┼───────┘
                                    │                │
               ┌────────────────────▼──┐  ┌──────────▼─────────┐
               │      PostgreSQL        │  │       Redis         │
               │   (Primary Storage)   │  │   (Queue / Cache)   │
               └───────────────────────┘  └──────────┬──────────┘
                                                      │
                                           ┌──────────▼───────────┐
                                           │    BullMQ Worker      │
                                           │  (Job Consumer)       │
                                           └──────────┬────────────┘
                                                      │
                                           ┌──────────▼───────────┐
                                           │   Docker Sandbox      │
                                           │  Isolated Container   │
                                           │  - No network         │
                                           │  - Read-only FS       │
                                           │  - CPU/Mem limits     │
                                           └──────────────────────┘
```

---

## 4. Backend Architecture

### 4.1 Modular Structure

The backend is organised around **feature modules**. Each module is a
self-contained vertical slice — it owns its routes, controller, validation
schemas, service, repository, and strategies. No layer file from one module
may be imported directly by another module.

```
src/modules/
│
├── auth/                          # Authentication & authorisation
│   ├── auth.routes.ts
│   ├── auth.controller.ts
│   ├── auth.schema.ts
│   ├── auth.service.ts
│   ├── auth.repository.ts
│   └── index.ts                   # ← public API of this module
│
├── submission/                    # Code submission & evaluation
│   ├── submission.routes.ts
│   ├── submission.controller.ts
│   ├── submission.schema.ts
│   ├── submission.service.ts
│   ├── submission.repository.ts
│   ├── strategies/
│   │   ├── evaluation.strategy.ts            # IEvaluationStrategy interface
│   │   ├── python.evaluation.strategy.ts     # Python implementation
│   │   ├── javascript.evaluation.strategy.ts # Future implementation
│   │   └── index.ts                          # Registry + registrations
│   └── index.ts
│
└── user/                          # User profile management
    ├── user.routes.ts
    ├── user.controller.ts
    ├── user.schema.ts
    ├── user.service.ts
    ├── user.repository.ts
    └── index.ts
```

### 4.2 Module Anatomy

Every module follows the same internal file structure and naming convention.
All layers are **co-located** — there are no global `controllers/`,
`services/`, or `repositories/` folders.

```
{module}/
├── {module}.routes.ts       # Route definitions — no logic
├── {module}.controller.ts   # HTTP boundary — parse, validate, respond
├── {module}.schema.ts       # Zod schemas + inferred DTO types
├── {module}.service.ts      # Business logic — strategies + Result
├── {module}.repository.ts   # Data access — Prisma only
└── index.ts                 # Public API — only export what other modules need
```

**Naming convention:** `{module}.{layer}.ts`

| File                 | Layer      |
| -------------------- | ---------- |
| `auth.routes.ts`     | Route      |
| `auth.controller.ts` | Controller |
| `auth.schema.ts`     | Validation |
| `auth.service.ts`    | Service    |
| `auth.repository.ts` | Repository |

> **Module boundary rule:** If module `A` needs something from module `B`,
> it imports **only** from `B/index.ts`. Reaching directly into
> `B/b.service.ts` or `B/b.repository.ts` is forbidden.

### 4.3 Layer Responsibilities

| Layer            | File                       | Responsibility                                                                                                                                                       |
| ---------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Route**        | `{module}.routes.ts`       | Register URL path + HTTP verb. Attach controller methods. Zero logic.                                                                                                |
| **Controller**   | `{module}.controller.ts`   | Invoke the validation layer to parse the request. Delegate to the service. Map the `Result` to an HTTP response.                                                     |
| **Validation**   | `{module}.schema.ts`       | Declare all Zod schemas for this module. Export inferred DTO types. Naming: lower camelCase identifiers. Single source of truth for all input shapes in this module. |
| **Service**      | `{module}.service.ts`      | Orchestrate business rules. Select and invoke strategies. Coordinate repositories. Return a typed `Result<T, E>`.                                                    |
| **Repository**   | `{module}.repository.ts`   | All and only Prisma interactions for this module's aggregate. Exposes a typed `I{Module}Repository` interface.                                                       |
| **Strategy**     | `strategies/*.strategy.ts` | One pluggable algorithm implementation per variant. Implements a shared interface defined in the same `strategies/` folder.                                          |
| **Module index** | `index.ts`                 | Re-exports the public surface of the module (router, service interface, public types). Hides all internal layers.                                                    |

### 4.4 Layer Communication Rules

Inside a module, the permitted call direction is strictly top-down:

```
Route → Controller → Validation (Zod parse)
                  ↓
               Service → Repository
                       → Strategy
                       → Queue (shared)

Worker (shared) → Service → Repository
```

| From       | May call                        | Must NOT call                             |
| ---------- | ------------------------------- | ----------------------------------------- |
| Route      | Controller                      | Service, Validation, Repository, Strategy |
| Controller | Service, Validation (Zod parse) | Repository, Queue directly                |
| Service    | Repository, Strategy, Queue     | Controller, Validation                    |
| Repository | Prisma client only              | Service, Controller, Validation, Strategy |
| Worker     | Service                         | Controller                                |
| Strategy   | Repository                      | Service, Controller, Validation           |

> **Validation is a one-way door.** It is called by the controller to parse
> incoming data before the service is ever invoked. The service only ever
> receives already-typed DTOs — it never re-validates.

### 4.5 Shared Kernel

Code that is genuinely shared across modules lives in `src/lib/` and
`src/config/`. These are **not** modules — they are infrastructure
primitives with no business logic of their own.

```
src/
├── lib/
│   ├── result.ts        # Result<T, E> type + ok() / err() helpers
│   ├── errors.ts        # Base domain error classes
│   └── logger.ts        # Structured logger instance
│
├── config/
│   └── config.ts        # Zod-validated env vars — single entry point to process.env
│
├── queues/
│   └── evaluation.queue.ts   # BullMQ producer (used by the submission module)
│
└── workers/
    └── evaluation.worker.ts  # BullMQ consumer
```

**Rules for the shared kernel:**

- `lib/` files may be imported by any layer in any module.
- `config/` is imported only by `lib/` files and `app.ts` — never inside a
  module's business logic directly.
- Modules must **not** add domain logic to `lib/` — it stays infrastructure.

---

## 5. Design Patterns

### 5.1 Repository Pattern

**Purpose:** Decouple business logic from the persistence layer. The service
layer never imports Prisma directly — it depends only on a repository
interface defined in the same module file. This makes the implementation
trivially swappable (e.g. for tests using an in-memory fake).

**Structure:**

```
ISubmissionRepository (interface, in submission.repository.ts)
    └── SubmissionRepository          — Prisma implementation
    └── InMemorySubmissionRepository  — test double
```

**Example:**

```typescript
// src/modules/submission/submission.repository.ts

import type { PrismaClient } from '@prisma/client';
import type { CreateSubmissionDto } from './submission.validation.js';

// --- Interface (the contract the service depends on) ---
export interface ISubmissionRepository {
  create(data: CreateSubmissionDto & { userId: string }): Promise<Submission>;
  findById(id: string): Promise<Submission | null>;
  findAllByUser(userId: string): Promise<Submission[]>;
  updateStatus(id: string, status: SubmissionStatus): Promise<Submission>;
}

// --- Prisma implementation ---
export class SubmissionRepository implements ISubmissionRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: CreateSubmissionDto & { userId: string }): Promise<Submission> {
    return this.db.submission.create({ data });
  }

  async findById(id: string): Promise<Submission | null> {
    return this.db.submission.findUnique({ where: { id } });
  }

  async findAllByUser(userId: string): Promise<Submission[]> {
    return this.db.submission.findMany({ where: { userId } });
  }

  async updateStatus(id: string, status: SubmissionStatus): Promise<Submission> {
    return this.db.submission.update({ where: { id }, data: { status } });
  }
}
```

> **Rule:** Repository methods are named after **what they do**, not how they
> do it. `findById` — not `prismaFindUnique`.

---

### 5.2 Service Pattern

**Purpose:** Centralise all business logic in a single, testable class.
Services receive their dependencies (repositories, strategy registry) via
constructor injection — making them unit-testable without a real database or
Docker daemon.

```typescript
// src/modules/submission/submission.service.ts

import type { ISubmissionRepository } from './submission.repository.js';
import type { IEvaluationStrategyRegistry } from './strategies/index.js';
import type { CreateSubmissionDto } from './submission.validation.js';
import type { Result } from '../../lib/result.js';
import { ok, err } from '../../lib/result.js';
import { NotFoundError, UnsupportedLanguageError } from '../../lib/errors.js';

export class SubmissionService {
  constructor(
    private readonly submissionRepo: ISubmissionRepository,
    private readonly strategyRegistry: IEvaluationStrategyRegistry
  ) {}

  async submit(
    dto: CreateSubmissionDto,
    userId: string
  ): Promise<Result<Submission, UnsupportedLanguageError>> {
    const strategy = this.strategyRegistry.get(dto.language);

    if (!strategy) {
      return err(new UnsupportedLanguageError(dto.language));
    }

    const submission = await this.submissionRepo.create({ ...dto, userId });
    await strategy.enqueue(submission);

    return ok(submission);
  }

  async getById(id: string): Promise<Result<Submission, NotFoundError>> {
    const submission = await this.submissionRepo.findById(id);

    if (!submission) {
      return err(new NotFoundError('Submission', id));
    }

    return ok(submission);
  }
}
```

---

### 5.3 Strategy Pattern

**Purpose:** Encapsulate each language's evaluation logic behind a shared
`IEvaluationStrategy` interface. The service never contains
`if language === 'python'` branches. Adding a new language = adding one new
class.

**Structure:**

```
IEvaluationStrategy (interface)
    └── PythonEvaluationStrategy
    └── JavaScriptEvaluationStrategy  ← future

IEvaluationStrategyRegistry (interface)
    └── EvaluationStrategyRegistry    ← map of language → strategy
```

**Interface:**

```typescript
// src/modules/submission/strategies/evaluation.strategy.ts

export interface EvaluationResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
}

export interface IEvaluationStrategy {
  readonly language: string;
  enqueue(submission: Submission): Promise<void>;
  execute(submission: Submission): Promise<EvaluationResult>;
}
```

**Concrete implementation:**

```typescript
// src/modules/submission/strategies/python.evaluation.strategy.ts

import type { IEvaluationStrategy, EvaluationResult } from './evaluation.strategy.js';

export class PythonEvaluationStrategy implements IEvaluationStrategy {
  readonly language = 'python';

  async enqueue(submission: Submission): Promise<void> {
    // Push job into BullMQ Python queue
  }

  async execute(submission: Submission): Promise<EvaluationResult> {
    // Spin up Docker container with python:3.12-slim
    // Run code with timeout + resource limits
    // Return stdout / stderr / exit code
  }
}
```

**Registry:**

```typescript
// src/modules/submission/strategies/index.ts

import type { IEvaluationStrategy } from './evaluation.strategy.js';

export interface IEvaluationStrategyRegistry {
  get(language: string): IEvaluationStrategy | undefined;
  register(strategy: IEvaluationStrategy): void;
}

export class EvaluationStrategyRegistry implements IEvaluationStrategyRegistry {
  private readonly strategies = new Map<string, IEvaluationStrategy>();

  register(strategy: IEvaluationStrategy): void {
    this.strategies.set(strategy.language, strategy);
  }

  get(language: string): IEvaluationStrategy | undefined {
    return this.strategies.get(language);
  }
}
```

**Registration at startup (`app.ts`):**

```typescript
// src/app.ts

const registry = new EvaluationStrategyRegistry();
registry.register(new PythonEvaluationStrategy());
// registry.register(new JavaScriptEvaluationStrategy()); ← add when needed
```

> **Adding a new language** = write one new class + one `registry.register()`
> call. No existing code changes. Open/Closed Principle in practice.

---

### 5.4 Result Pattern

**Purpose:** Make failure explicit at the type level. Services return
`Result<T, E>` instead of throwing for expected domain errors. The controller
is forced by the TypeScript compiler to handle both `ok` and `err` branches —
no silent failures.

**Core type:**

```typescript
// src/lib/result.ts

export type Ok<T> = { success: true; value: T };
export type Err<E> = { success: false; error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({ success: true, value });
export const err = <E>(error: E): Err<E> => ({ success: false, error });

export const isOk = <T, E>(r: Result<T, E>): r is Ok<T> => r.success === true;
export const isErr = <T, E>(r: Result<T, E>): r is Err<E> => r.success === false;
```

**Domain errors:**

```typescript
// src/lib/errors.ts

export class NotFoundError extends Error {
  readonly code = 'NOT_FOUND';
  constructor(resource: string, id: string) {
    super(`${resource} with id "${id}" was not found.`);
  }
}

export class UnsupportedLanguageError extends Error {
  readonly code = 'UNSUPPORTED_LANGUAGE';
  constructor(language: string) {
    super(`Language "${language}" is not supported.`);
  }
}

export class UnauthorizedError extends Error {
  readonly code = 'UNAUTHORIZED';
  constructor() {
    super('Authentication required.');
  }
}
```

---

### 5.5 Patterns Working Together

The following example shows a complete request cycle for `POST /submissions`,
illustrating how the Validation layer, Service pattern, Repository pattern,
Strategy pattern, and Result pattern interact inside a single module.

**Validation layer** — single source of truth for all input shapes:

```typescript
// src/modules/submission/submission.schema.ts

import { z } from 'zod';

export const createSubmissionSchema = z.object({
  code: z.string().min(1).max(10_000),
  language: z.enum(['python']),
});

export const getSubmissionSchema = z.object({
  id: z.string().uuid(),
});

// Inferred DTO types — consumed by controller, service, and repository
export type CreateSubmissionDto = z.infer<typeof createSubmissionSchema>;
export type GetSubmissionDto = z.infer<typeof getSubmissionSchema>;
```

**Controller** — parses via the Validation layer, delegates to the Service,
maps the Result to an HTTP response:

```typescript
// src/modules/submission/submission.controller.ts

import type { Request, Response } from 'express';
import { createSubmissionSchema } from './submission.validation.js';
import type { SubmissionService } from './submission.service.js';
import { isErr } from '../../lib/result.js';
import { UnsupportedLanguageError } from '../../lib/errors.js';

export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  async create(req: Request, res: Response): Promise<void> {
    // 1. Validation layer parses and types the raw request body
    const parsed = createSubmissionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    // 2. Delegate to the service — controller contains zero business logic
    const result = await this.submissionService.submit(
      parsed.data,
      req.user.id // set by auth middleware
    );

    // 3. Unwrap the Result — both branches must be explicitly handled
    if (isErr(result)) {
      if (result.error instanceof UnsupportedLanguageError) {
        res.status(422).json({ error: result.error.message });
        return;
      }
      res.status(500).json({ error: 'Unexpected error.' });
      return;
    }

    res.status(202).json({ data: result.value });
  }
}
```

**Data flow summary:**

```
POST /submissions
  │
  ▼
submission.routes.ts       → mounts SubmissionController.create
  │
  ▼
submission.controller.ts   → submission.schema.ts        [Zod.safeParse]
  │                           createSubmissionSchema
  ▼
submission.service.ts      → strategyRegistry.get(language)  [selects strategy]
  │                         → submission.repository.ts       [persists record]
  │                         → strategy.enqueue(submission)   [enqueues job]
  │                           return ok(submission)          [Result<T, E>]
  ▼
submission.controller.ts   → isErr(result)?                  [unwraps Result]
  │                           res.status(422) : res.status(202)
  ▼
HTTP Response
```

---

## 6. Frontend Architecture

```
src/
├── features/                    # One folder per product feature
│   └── submissions/
│       ├── components/          # UI components scoped to this feature
│       ├── hooks/               # React hooks (useSubmission, etc.)
│       └── index.ts             # Public API of the feature
│
├── api/                         # All fetch / WebSocket calls
│   ├── submissions.api.ts
│   └── http.ts                  # Shared axios/fetch instance
│
├── components/                  # Shared UI primitives (Button, Input, etc.)
├── lib/                         # Frontend utilities
└── main.tsx
```

**Rules:**

- `fetch` / `axios` calls live **only** inside `src/api/` — never in
  components or hooks.
- Feature folders export a public interface via `index.ts` — cross-feature
  imports must go through this boundary.
- API response types are derived from the same Zod schemas as the backend
  (via a future `libs/shared-types` package).

---

## 7. Data Flow — Code Submission

```
User submits code
      │
      ▼
 [Frontend]
 api/submissions.api.ts
 POST /api/submissions
      │
      ▼
 [Backend — Sync path]
 submission.routes.ts
      → submission.controller.ts
           → submission.schema.ts   (Zod parse — typed DTO)
           → submission.service.ts
                → strategyRegistry.get('python')
                → submission.repository.ts  → PostgreSQL
                → evaluationQueue.add(job)  → Redis
           → Result<Submission>  → HTTP 202 Accepted
      │
      ▼
 [Frontend]
 Renders "pending" state
 Subscribes via Socket.IO for live status updates
      │
      ▼
 [Backend — Async path]
 evaluation.worker.ts dequeues job
      │
      ├─ PythonEvaluationStrategy.execute(submission)
      │      └─ Spins up Docker container (python:3.12-slim)
      │         Runs user code with timeout + resource limits
      │         Captures stdout / stderr / exit code
      │
      ├─ submission.repository.ts → updateStatus(id, 'completed') → PostgreSQL
      │
      └─ Socket.IO emits 'submission:completed' → Frontend
```

---

## 8. Error Handling Strategy

| Error origin            | Type                       | Handled by                                     |
| ----------------------- | -------------------------- | ---------------------------------------------- |
| Invalid request body    | `ZodError`                 | Controller — 400 Bad Request                   |
| Unsupported language    | `UnsupportedLanguageError` | Controller — 422 Unprocessable                 |
| Resource not found      | `NotFoundError`            | Controller — 404 Not Found                     |
| Unauthenticated request | `UnauthorizedError`        | Controller — 401 Unauthorized                  |
| Unexpected server error | `Error`                    | Global Express error handler — 500             |
| Sandbox timeout         | `ExecutionTimeoutError`    | Worker — marks submission as `timed_out`       |
| Sandbox OOM             | `ExecutionMemoryError`     | Worker — marks submission as `memory_exceeded` |

**Global error handler (registered last in `app.ts`):**

```typescript
// src/app.ts — catches anything thrown outside of the Result pattern
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});
```

> **Principle:** Domain errors that are _expected_ (not found, invalid input,
> unsupported language) travel as `Result<T, E>` values — they are
> **data**, not exceptions. Only truly _unexpected_ failures (infrastructure
> crashes, programmer mistakes) are thrown and caught by the global handler.

---

## 9. Tech Stack Reference

| Concern            | Technology              | Rationale                                                              |
| ------------------ | ----------------------- | ---------------------------------------------------------------------- |
| Frontend framework | React 19 + Vite 8       | Component model + fast HMR                                             |
| Styling            | TailwindCSS             | Utility-first, no CSS drift                                            |
| Backend framework  | Express 5               | Minimal, well-understood                                               |
| Language           | TypeScript 5.9 (strict) | Type safety across all layers                                          |
| ORM                | Prisma                  | Type-safe DB access, declarative migrations                            |
| Validation         | Zod 4                   | Schema-first, inferred DTOs — co-located in each module's `.schema.ts` |
| Primary database   | PostgreSQL              | ACID compliance, relational model                                      |
| Job queue / cache  | Redis + BullMQ          | Reliable async job processing                                          |
| Real-time          | Socket.IO               | Bidirectional events for submission status                             |
| Sandbox            | Docker                  | OS-level isolation with resource limits                                |
| Package manager    | pnpm + workspaces       | Fast installs, strict dependency isolation                             |
| Testing            | Jest + Playwright       | Unit/integration + E2E coverage                                        |
