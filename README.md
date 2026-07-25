# LeadFlow CRM

LeadFlow CRM is an AI-powered, production-quality, lightweight Lead Management Platform designed for small startup sales teams. It features secure authentication, role-based access, lead tracking, pipeline management, analytics dashboards, and built-in AI tools for lead summaries, email generation, intelligent search, and sales insights.

It is structured with clean architecture principles: **Routes ➡️ Controllers ➡️ Services ➡️ Repositories (Prisma)**.

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

---

## Deployment Steps (Render.com)

See the detailed Render deployment guide here: [render_deployment_guide.md](./render_deployment_guide.md).
