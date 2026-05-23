# Expense Tracker API

A production-ready, type-safe RESTful backend engine built with Node.js, Express, TypeScript, and Prisma ORM. This API powers personal finance interfaces with secure multi-tenant isolation, custom user category management, automated query pagination, dynamic column sorting, and relational analytics pipelines.

### 🌐 Live Deployments
* **Live Base URL:** `https://expense-tracker.spdwivedi.me`
* **Interactive API Documentation (Swagger UI):** `https://expense-tracker.spdwivedi.me/docs`

---

## 🛠️ Local Setup Runbook

Follow these sequential steps to install, configure, and boot the API engine locally on your machine:

### 1. Download Dependencies
Ensure Node.js (v18+) is active, navigate to the project directory, and install the required node modules:
```bash
npm install
```

### 2. Configure Local Environment State
Create a `.env` configuration file in the project's root directory and populate it with your environment parameters:
```env
PORT=5000
DATABASE_URL="postgresql://db_user:secure_password@localhost:5432/expense_tracker?schema=public"
JWT_SECRET="develop_cryptographic_long_random_string_signature_key"
```

### 3. Sync Database Migrations
Synchronize your local schema layouts with your relational database and build your custom type-safe Prisma client:
```bash
npx prisma migrate dev
```

### 4. Execute Seed Engine
Populate the database with global system default categories (Food, Transport, Bills, Health, Shopping, Travel, Leisure, Other) along with baseline administrative testing configurations:
```bash
npm run db:seed
```

### 5. Boot the Development Engine
Launch your server locally with real-time file watching:
```bash
npm run dev
```
The server will initialize locally at `http://localhost:5000`. You can test your local routes via the Swagger UI panel at: `http://localhost:5000/docs`

### 6. Verify with the Integration Test Suite
Execute the Vitest testing suite to run automated integration tests for your authentication, route security guards, user-isolation parameters, and transaction loops:
```bash
npm test
```

## 🏛️ Technical Stack & Architectural Justifications

The architectural design of this engine is structured around rigorous type boundaries, explicit data validation, decoupled storage primitives, and horizontal scalability.

### 1. Language: TypeScript (v6.0)
* **Type-Safe Financial Data Ledger:** Managing transaction ledgers leaves zero margin for data mutation or type coercion bugs (e.g., accidentally performing arithmetic operations on currency inputs cast as strings). TypeScript guarantees strict compile-time verification across all tracking models.
* **Granular Request Contexts:** Incoming request bodies, multi-parameter query strings, and JWT auth payloads are explicitly typed. This guarantees that unmapped or contaminated inputs are trapped before reaching downstream controllers or database execution blocks.
* **Auto-Inferred Schema Bindings:** Changes to the Prisma database design automatically trigger type regeneration across the source code, creating a single source of truth for the data model.

### 2. Framework: Express.js (v5.2) via Node.js
* **Middleware Pipeline Architecture:** Express was selected for its minimalist, unopinionated footprint, providing complete control over the HTTP request/response lifecycle. This makes it straightforward to build custom middleware chains for rate limiting, traffic logging, and JWT validation.
* **Asynchronous Non-Blocking I/O:** Powered by the Node.js event loop, the framework handles heavy data traffic and multiple database operations smoothly without bottlenecking system threads.
* **Unified Global Error Handling:** Features a centralized error-catching middleware that isolates operational exceptions, preventing raw system details or database error strings from leaking to client interfaces.

### 3. Database Layer: Prisma ORM with PostgreSQL
* **Infrastructure Independence:** Prisma acts as a decoupled abstraction layer over raw SQL. This decouples database engine configuration from core application routines, allowing the API container to connect seamlessly to external instances (such as a database running on Oracle Cloud infrastructure) simply by updating the connection string environment variables.
* **Automated Migration Engine:** Tracks structural changes using chronological SQL history files. It offers safe, zero-downtime execution in production environments using deployment-focused commands.
* **Optimized Query Generation:** Features built-in pooling and highly efficient relational loading techniques to handle complex database queries like data aggregation, date-bounded grouping, and pagination calculations efficiently.

### 4. Testing Suite: Vitest & Supertest
* **Multi-Threaded Parallel Sandboxing:** Vitest offers fast test execution using modern worker threads, isolating test suites completely from each other.
* **Zero-Network Port Footprint:** Supertest connects natively to the Express application shell. It simulates HTTP request loops internally within memory without needing to bind to active network ports, avoiding port conflicts during automated CI/CD pipeline runs.
* **Real Relational Testing:** Avoids over-mocking by testing directly against actual transactional models, verifying that constraints, database indexes, and isolation boundaries work correctly end-to-end.

## ⚡ Core Functional Features

The backend engine delivers a multi-tenant personal finance architecture. All database actions run behind security filters that completely isolate data between users.

### 👤 1. Identity & User Management Module
* **Cryptographic Registration:** Provisions new user profiles using verified email addresses. Plaintext passwords are intercepted and processed using `bcryptjs` with a cost factor of 10, ensuring no plaintext credentials ever hit the database logs or storage volumes.
* **Token-Issued Sessions:** Authenticates login credentials and signs stateless, tamper-proof JSON Web Tokens (JWT) containing the unique user ID payload.
* **Profile Synchronization:** Offers protected data operations to read or safely modify active account properties (name, email) after verifying incoming data schemas.
* **Re-authenticated Password Changes:** Requires explicit confirmation of the user's active password before writing a newly generated hash to the database, preventing unauthorized account takeovers.
* **Decoupled Session Revocation:** Handles clean logout actions through token-expiry behavior and frontend token destruction, keeping the server lean and horizontally scalable.

### 💵 2. Transaction Ledger Module
* **Relational Ledger Logging:** Creates income or expense rows defined by exact numerical amounts, category keys, timestamps, and optional text descriptions.
* **Strict Multi-Tenant Isolation:** Appends the validated `userId` from the JWT session directly to every database query. Users are completely blocked from viewing, updating, or deleting tracking items belonging to other profiles.
* **Dynamic Parameter Filters:** Parses incoming query parameters to slice ledger views by transaction type (`INCOME`/`EXPENSE`), specific category IDs, or bounding date ranges.
* **Double-Pass Pagination Engines:** Uses parallelized database counts and offset queries to return custom row counts paired with complete pagination metadata (`page`, `limit`, `totalCount`, `totalPages`).
* **Multi-Column Column Sorting:** Offers clean ordering options, sorting rows by `date` or `amount` in either ascending or ascending order.

### 🏷️ 3. Category Management Module
* **Global System Defaults:** Seeds a permanent, read-only category list available to all users (`Food`, `Transport`, `Bills`, `Health`, `Shopping`, `Travel`, `Leisure`, `Other`).
* **Custom Extensions:** Empowers individual users to create custom categories to personalize their tracking taxonomy.
* **Immutability Constraints:** Blocks any attempts to update or delete system default category rows (`403 Forbidden`). Users retain full modification and deletion rights over their personal custom rows.

### 📊 4. Analytical Aggregations Module
* **Financial Position Summaries:** Aggregates date-bounded transactional totals to compute gross incoming capital, expenditures, and net balances dynamically at the database level.
* **Categorized Cost Matrices:** Groups spending rows using relational `groupBy` queries, returning exact cost totals alongside their proportional percentage share of total expenditures.
* **Chronological Trend Streams:** Iterates backward from the active timeline to construct historical monthly data buckets, tracking gross income and expense metrics across configurable month spans.

## 📋 API Blueprint & Route Manifest

All endpoints follow RESTful design conventions, leverage self-descriptive URI mapping, and return consistent, structured JSON payloads. Protected endpoints require a valid header configuration: `Authorization: Bearer <JWT_TOKEN>`.

### 🔐 Authentication & Profiles
| Method | Route Path | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/register` | Public | Registers a new user identity structure |
| **POST** | `/api/v1/auth/login` | Public | Validates user credentials and issues a signed JWT |
| **GET** | `/api/v1/auth/profile` | Protected | Fetches active profile metadata for the current session |
| **PUT** | `/api/v1/auth/profile` | Protected | Updates editable account details (name, email) |
| **PUT** | `/api/v1/auth/change-password` | Protected | Updates account access credentials with current password validation |
| **POST** | `/api/v1/auth/logout` | Protected | Gracefully handles session clearance on the client side |

### 🏷️ Category Taxonomy
| Method | Route Path | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/categories` | Protected | Fetches a combined list of global defaults and personal custom rows |
| **POST** | `/api/v1/categories` | Protected | Provisions a new custom tracking category |
| **PUT** | `/api/v1/categories/:id` | Protected | Modifies custom category labels |
| **DELETE** | `/api/v1/categories/:id` | Protected | Erases custom categories cleanly from the database |

### 💵 Transaction Ledger
| Method | Route Path | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/transactions` | Protected | Creates a new transaction entry linked to a category |
| **GET** | `/api/v1/transactions` | Protected | Fetches a paginated, sorted, and filtered transaction list |
| **GET** | `/api/v1/transactions/:id` | Protected | Isolates a single transaction record by its unique ID |
| **PUT** | `/api/v1/transactions/:id` | Protected | Modifies properties of a specific ledger record |
| **DELETE** | `/api/v1/transactions/:id` | Protected | Removes a transaction record permanently from the ledger |

### 📊 Financial Intelligence Analytics
| Method | Route Path | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/analytics/overview` | Protected | Compiles date-bounded gross income, total expenses, and net balance |
| **GET** | `/api/v1/analytics/category-breakdown` | Protected | Groups expenditures by category with total amounts and percentages |
| **GET** | `/api/v1/analytics/month-over-month` | Protected | Streams monthly income and expense trends across a timeline |

---

## 🛡️ Production Security & Quality Engineering

* **Stateless JWT Configuration:** Authentication strings are cryptographically signed on the server and expire exactly **24 hours** after issuance. Session state is entirely self-contained within the client token payload, removing database session overhead and enabling the application layer to scale horizontally across server instances.
* **Brute-Force Rate Limiting:** Public endpoints (`/register`, `/login`) are protected by `express-rate-limit` middleware. Network traffic is restricted to a maximum of **15 requests per 15-minute window** per unique IP address to block credential-stuffing automated scripts.
* **HTTP Traffic Tracing:** The entry module integrates `morgan('dev')` logging middleware to pipe real-time transactional logs—detailing request methods, endpoint paths, HTTP status codes, and server response latencies—directly to standard execution outputs.
* **Sanitized Exception Handling:** Centralized middleware catches runtime errors across the application. It maps errors to clear HTTP status codes and friendly error messages while ensuring internal infrastructure stack traces are never exposed to the client.

---

## ⚖️ Engineering Assumptions, Trade-offs & Future Scope

### Assumptions & Trade-offs Made
* **Floating-Point Arithmetic:** Financial balances are processed as JavaScript `Number` primitives (double-precision floats) to simplify initial data ingestion. For enterprise-level banking scalability, these schemas should be migrated to fixed-point strings or custom `Decimal` structures to avoid binary floating-point rounding discrepancies during high-volume calculations.
* **Token Invalidation Strategy:** To keep the core infrastructure lightweight and stateless, logout operations rely on the frontend clearing its local storage token rather than managing server-side token blacklists. This maximizes request performance at the expense of absolute server-directed token revocation control.
* **Database-Driven Integration Testing:** Automated quality checks run integration tests against a live database instance rather than utilizing abstract mocking libraries. This guarantees that constraint behavior, relational cascading rules, and multi-table operations are verified accurately against real engine engines, though it requires a connected test database environment to run.

### Future Scope & Improvements (With More Time)
1. **Schema Validation Middleware:** Centralize input parsing by replacing inline controller checks with standard object schema validation layers (such as **Zod** or **Joi**) to validate request payloads before they hit business routing handlers.
2. **Stateful Token Revocation Tiers:** Integrate a high-speed, in-memory data store (like Redis) to log invalidated tokens, enabling immediate server-side session termination during logout while keeping database read latencies minimal.
3. **Compound Database Indexing:** Apply explicit relational compound indexes within the Prisma database schema—specifically pairing user identifiers with date fields and transactional types—to maintain fast query speeds as database tables scale to millions of rows.