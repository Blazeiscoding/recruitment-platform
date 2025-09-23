## Recruitment Platform Prototype (Next.js + Prisma + MongoDB Atlas)

A minimal recruitment platform with:

- Registration API with optional profile fields
- Login API with JWT authentication
- Token verification API
- App Router pages: Login, Register, Profile
- Prisma schema targeting MongoDB Atlas
- Zod validation on API inputs

### Quick start

1. Create `.env` with your Atlas URL and JWT config:

```bash
DATABASE_URL="your-mongodb-atlas-connection-string"
JWT_SECRET="a-long-random-secret"
JWT_EXPIRES_IN="7d"
```

2. Push the schema and generate the Prisma client:

```bash
npx prisma db push
npx prisma generate
```

3. Run the app:

```bash
npm run dev
```

Open `http://localhost:3000` → you’ll be redirected to `/login`.

---

## API Documentation

All endpoints return JSON. Error responses include a top-level `message`.

### POST `/api/auth/register`

- Purpose: Create a user and return a JWT.
- Body (Zod-validated; optional fields may be omitted or empty):

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "phone": "999-000-1234",
  "headline": "Frontend Engineer",
  "bio": "I love building UIs.",
  "location": "Bangalore",
  "skills": "React, TypeScript, Node",
  "experienceYears": 3,
  "linkedinUrl": "https://www.linkedin.com/in/janedoe",
  "portfolioUrl": "https://janedoe.dev"
}
```

- 201 Response:

```json
{
  "message": "Registered",
  "data": {
    "user": {
      "id": "66f...",
      "email": "jane@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "phone": "999-000-1234",
      "headline": "Frontend Engineer",
      "bio": "I love building UIs.",
      "location": "Bangalore",
      "skills": ["React", "TypeScript", "Node"],
      "experienceYears": 3,
      "linkedinUrl": "https://www.linkedin.com/in/janedoe",
      "portfolioUrl": "https://janedoe.dev",
      "createdAt": "2025-09-23T..."
    },
    "token": "<jwt>"
  }
}
```

### POST `/api/auth/login`

- Purpose: Authenticate with email/password and return a JWT.
- Body:

```json
{ "email": "jane@example.com", "password": "secret123" }
```

- 200 Response:

```json
{
  "message": "Logged in",
  "data": {
    "user": {
      "id": "66f...",
      "email": "jane@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "createdAt": "2025-09-23T..."
    },
    "token": "<jwt>"
  }
}
```

### GET `/api/auth/verify`

- Purpose: Validate a JWT and return the user payload.
- Headers: `Authorization: Bearer <jwt>`
- 200 Response:

```json
{
  "message": "OK",
  "data": {
    "user": {
      "id": "66f...",
      "email": "jane@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "createdAt": "2025-09-23T..."
    }
  }
}
```

---

## Database Schema (Prisma → MongoDB)

```prisma
model User {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  email           String   @unique
  passwordHash    String
  firstName       String
  lastName        String
  phone           String?
  headline        String?
  bio             String?
  location        String?
  skills          String[]
  experienceYears Int?
  linkedinUrl     String?
  portfolioUrl    String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

generator client {
  provider = "prisma-client-js"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

Notes:

- `id` maps to MongoDB `_id` as `ObjectId`.
- `skills` is an array of strings.
- Optional fields can be omitted on registration and added later.

---

## Architectural Choices

- Next.js App Router (app directory) for pages; API routes in `pages/api` for simplicity.
- Prisma as the data access layer targeting MongoDB Atlas, enabling type-safe queries.
- JWT-based stateless auth stored in `localStorage` for the prototype; verified via `/api/auth/verify`.
- Zod for runtime input validation on API routes to ensure payload correctness.
- Minimal UI with Tailwind v4 styles via `app/globals.css` and small design helpers.

### Why this approach?

- Fast iteration: App Router pages are simple to build and compose; API routes are colocated.
- Prisma + MongoDB gives a flexible schema while staying type-safe in the application code.
- Stateless JWT keeps the prototype simple and scalable across instances.

---

## Authentication & Security Measures

- Passwords hashed with bcrypt (`bcryptjs`).
- JWT signed with `JWT_SECRET` and expiration via `JWT_EXPIRES_IN`.
- Authorization is required for protected data (verified by `/api/auth/verify`).
- Input validation with Zod on `register` and `login` prevents malformed inputs.
- Basic normalization: emails are lowercased and trimmed; optional URLs validated when present.

Recommendations for production:

- Store JWT in HTTP-only secure cookies; add CSRF protection for state-changing routes.
- Rate limit auth endpoints and add IP/device fingerprinting for abuse mitigation.
- Enforce strong password policy and add optional 2FA.
- Centralized secrets management (e.g., Vercel, Vault, AWS Secrets Manager).

---

## Error Handling Approach

- APIs return a consistent JSON shape with `message` and, on success, a `data` object.
- Zod validation errors collapse to the first human-readable message for clarity.
- Known client errors use 400/401/409; unexpected issues return 500 with a generic message.
- Server logs include the error context but avoid leaking internals to clients.

---

## Scaling & Improvement Suggestions

- Persistence & Data

  - Add indexes on frequently queried fields (e.g., `email`). Prisma with Mongo will reflect unique indexes.
  - Move profile data to a separate `Profile` collection if it grows large or becomes optional per user.

- Authentication

  - Switch to HTTP-only cookies for JWT; add refresh tokens and token rotation.
  - Use a dedicated auth provider (Clerk/Auth0/Cognito) if you prefer managed flows.

- API & Services

  - Introduce a service layer and DTOs to decouple controllers from Prisma models.
  - Add request logging and tracing (OpenTelemetry) and rate limiting (e.g., upstash/redis).

- Frontend

  - Add form-level validation with Zod on the client side before submit.
  - Introduce a design system with reusable components and theming.

- Testing & QA

  - Unit tests for validation and auth logic; integration tests for API routes.
  - E2E tests for flows (register → login → profile) using Playwright.

- Deployment
  - Vercel or similar; define environment variables per environment.
  - Set up CI to run lint/test, preview deployment, and database checks.

---

## Project Structure (trimmed)

```
app/
  layout.js
  page.js           # redirects to /login
  login/page.js
  register/page.js
  profile/page.js
lib/
  prisma.js         # Prisma client singleton
  auth.js           # JWT + password helpers
  validation.js     # Zod schemas
pages/api/auth/
  register.js
  login.js
  verify.js
prisma/
  schema.prisma
```

---

## License

MIT (for the purpose of this assignment)
