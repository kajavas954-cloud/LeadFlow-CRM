<<<<<<< HEAD
# LeadFlow CRM

LeadFlow CRM is a production-quality, lightweight Lead Management Platform designed for small startup sales teams. It feels like software tools like Linear, HubSpot, or Pipedrive.

It is structured with clean architecture principles: **Routes → Controllers → Services → Repositories (Prisma)**.

---

## Folder Structure

```text
Project Fullstack/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database models & schema (PostgreSQL)
│   │   └── seed.ts              # Seeding script for default admin/sales users
│   ├── src/
│   │   ├── config/              # Prisma client, JWT variables, OpenAPI JSON
│   │   ├── controllers/         # Parses HTTP endpoints and triggers services
│   │   ├── middleware/          # JWT, Role authorization, Zod validation, Rate limiters
│   │   ├── models/              # Request-response validation schemas (Zod)
│   │   ├── repositories/        # Direct database Prisma query bindings
│   │   ├── services/            # Business logic (lead scoring, math captcha check)
│   │   ├── routes/              # Express API endpoints mapping
│   │   ├── tests/               # Integration tests (Jest & Supertest)
│   │   ├── app.ts               # App configurations (Cors, Helmet, rateLimit)
│   │   └── server.ts            # App startup entry point
│   ├── jest.config.cjs
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable components (Layout, ProtectedRoute, CommandPalette)
│   │   ├── contexts/            # Theme, Auth, and Toast notification systems
│   │   ├── hooks/               # Custom hooks
│   │   ├── pages/               # Views (Dashboard, Board, LeadsList, LeadDetails, PublicForm)
│   │   ├── services/            # Custom fetch client wrapper with token refresh
│   │   ├── index.css            # Typography imports and glassmorphic card designs
│   │   ├── App.tsx              # Router paths mapping
│   │   └── main.tsx             # DOM mounting entry
│   ├── tailwind.config.js       # Tailwind configuration for custom palette and dark mode
│   ├── postcss.config.js
│   └── tsconfig.json
└── README.md
```

---

## Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    users {
        string id PK
        string name
        string email UK
        string password
        enum role "ADMIN | SALES_MEMBER"
        string refreshToken
        datetime createdAt
        datetime updatedAt
    }

    leads {
        string id PK
        string name
        string email UK
        string phone
        string company
        string website
        enum source
        string industry
        enum priority
        enum status
        int score
        boolean archived
        string assignedToId FK
        string createdById FK
        datetime createdAt
        datetime updatedAt
    }

    lead_notes {
        string id PK
        string leadId FK
        string authorId FK
        text note
        datetime createdAt
    }

    activity_logs {
        string id PK
        string leadId FK
        string userId FK
        string action
        json metadata
        datetime timestamp
    }

    users ||--o{ leads : "manages"
    users ||--o{ lead_notes : "writes"
    users ||--o{ activity_logs : "creates"
    leads ||--o{ lead_notes : "contains"
    leads ||--o{ activity_logs : "records"
```

---

## Environment Variables Configuration

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
DATABASE_URL="postgresql://username:password@neon-db-hostname/databasename?sslmode=require"
JWT_SECRET="your-super-secret-access-token-key-string"
JWT_REFRESH_SECRET="your-super-secret-refresh-token-key-string"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

---

## Installation & Setup

### 1. Database & Backend Setup
Navigate to the `backend/` directory:
```bash
cd backend

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Seed database with default admin & sales representatives
npm run prisma:seed

# Launch backend dev server
npm run dev
```

### 2. Frontend Setup
Navigate to the `frontend/` directory:
```bash
cd ../frontend

# Install dependencies
npm install

# Launch frontend dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Running Integration Tests

To run the backend integration test suite:
```bash
cd backend
npm run test
```
The test suite utilizes a global Jest mock of `@prisma/client` to execute all tests completely offline, verifying:
- Authentication & JWT cookie management
- Role-based route blocks (Admin assignments/deletions vs. Sales reps restrictions)
- Leads CRUD parameters and duplicate checks
- Notes creations and author deletion privileges
- Activity log event creations on updates

---

## API Documentation

Interactive OpenAPI/Swagger documentation is hosted at:
`http://localhost:5000/docs`

Key routes summary:
- `POST /api/auth/register` - Create a user account
- `POST /api/auth/login` - Log in (returns access JWT, sets HTTP-only refresh cookie)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Clear user session
- `GET /api/leads` - Paginated leads list with status/priority/source filters and search
- `POST /api/leads` - Create lead
- `PUT /api/leads/:id` - Edit lead (recalculates scoring metrics)
- `DELETE /api/leads/:id` - Delete lead (Admin only)
- `PATCH /api/leads/:id/assign` - Assign to sales representative (Admin only)
- `POST /api/leads/:id/notes` - Add lead interaction note
- `GET /api/leads/:id/activity` - Fetch lead history audit logs
- `POST /api/leads/public` - Standalone inquiries capture form (Math captcha protected)

---

## Deployment Steps

### 1. Database (Neon PostgreSQL)
1. Register on [Neon](https://neon.tech/) and spawn a serverless PostgreSQL cluster.
2. Retrieve the connection string `postgres://...` and set it as `DATABASE_URL`.

### 2. Backend (Render)
1. Create a Web Service on [Render](https://render.com/) and hook it to your GitHub repository.
2. Select Environment: `Node`.
3. Set build command: `cd backend && npm install && npm run build`.
4. Set start command: `cd backend && npm start`.
5. Under Environment variables, configure `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, and `PORT`.

### 3. Frontend (Vercel)
1. Create a Project on [Vercel](https://vercel.com/) linked to your repository.
2. Set Root Directory: `frontend`.
3. Build Settings will auto-detect Vite. Ensure environment variable `VITE_API_URL` points to your backend Render URL (e.g., `https://your-backend.onrender.com/api`).
4. Click Deploy.
=======
# LeadFlow-CRM
LeadFlow CRM is an AI-powered lead management platform built with React, TypeScript, Node.js, Express, Prisma, and PostgreSQL. It features secure authentication, role-based access, lead tracking, pipeline management, analytics dashboards, and AI tools for lead summaries, email generation, intelligent search, and sales insights.
>>>>>>> ef6f1069aee4c30106e9af6ff0abfdaf4aa57792
