# TIVIT - Product Catalog API

This is a REST API developed with [NestJS](https://github.com/nestjs/nest) for managing a product catalog. It features a complete category and product management system with automated auditing and modern validation.

## Architecture

The project follows a **Modular Architecture**, organized by domain logic to ensure scalability and maintainability.

### Additional Libraries used
- [TypeORM](https://typeorm.io/)
- [Zod](https://zod.dev/)
- [Jest](https://jestjs.io/)

### Key Components:
- **Modules**: Each domain (Product, Category, Audit) is encapsulated in its own module.
- **Controllers**: Handle incoming HTTP requests and map them to service logic.
- **Repositories**: Extend TypeORM's `Repository` to handle data persistence and complex queries.
- **Entities**: Define the database schema using TypeORM decorators.
- **DTOs & Validation**: Input data is strictly validated using Zod schemas via a custom `ZodValidationPipe`.
- **Subscribers**: TypeORM Event Subscribers are used for cross-cutting concerns like auditing.

## Auditing & Subscribers

The project implements an automated audit log system to track every change made to products and categories.

- **TypeORM Subscribers**: `ProductSubscriber` and `CategorySubscriber` listen for database events (`afterInsert`, `beforeUpdate`, `afterUpdate`).
- **Audit Logic**:
    - **CREATE**: When a new record is inserted, a log is created with the initial state.
    - **UPDATE**: Before an update, the subscriber captures the current state (`oldRecord`). After the update, it compares it with the new state (`newRecord`). If changes are detected, it persists both versions in the `Audit` table.
- **Audit Entity**: Stores the entity name, action type (CREATE/UPDATE), timestamp, and JSON representations of the records.

## 🛠️ Requirements

- [Node.js](https://nodejs.org/) (v20 or higher)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- [NPM](https://www.npmjs.com/) (v10 or higher)

## 🚀 Getting Started

### 1. Environment Configuration

Create a `.env` file in the root directory with the following variables (used by both Docker and the NestJS application):

```env
POSTGRES_CONTAINER_NAME=tivit-postgres
POSTGRES_DB=tivit_catalog
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin_pass
POSTGRES_PORT=5432
```

### 2. Setup Database

Start the PostgreSQL database using Docker Compose:

```bash
docker-compose up -d
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
# Development (watch mode)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`.

## 🧪 Running Tests

The project includes unit, integration, and end-to-end tests (e2e tests uses sqlite as DB to make is easier to run the tests locally).

```bash
# Unit & Integration tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage report
npm run test:cov
```
