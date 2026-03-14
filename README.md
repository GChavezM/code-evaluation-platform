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

Pendiente por completar

---

## Endpoints

Pendiente por completar

---

## Cómo Ejecutar el Proyecto

### Prerequisitos

- [Docker](https://docs.docker.com/get-started/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/en/download) >= 20.x LTS
- [pnpm](https://pnpm.io/installation) >= 9.x

### 1. Clonar el repositorio

```bash
git clone https://github.com/GChavezM/code-evaluation-platform.git
cd code-evaluation-platform
```

### 2. Configurar variables de entorno

### 3. Instalar dependencias

### 4. Levantar la infraestructura

### 5. Ejecutar migraciones de base de datos

### 6. Iniciar el entorno de desarrollo

### 7. Levantar el sistema completo con Docker Compose

### Scripts disponibles

---

## Variables de Entorno

Pendiente por completar

---

## Equipo y Roles

| Nombre         | Rol                  | Email                       |
| -------------- | -------------------- | --------------------------- |
| Gabriel Chávez | Full Stack Developer | <gchavezmardonez@gmail.com> |

---

## Lista de Tareas

Seguimiento del progreso de implementación del proyecto.

- [ ] Completar el `README.md` del repositorio
- [ ] ...
