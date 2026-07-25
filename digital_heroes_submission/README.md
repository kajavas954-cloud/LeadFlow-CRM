# LeadFlow CRM - AI-Powered Sales Platform

LeadFlow CRM is an AI-powered, production-quality Lead Management Platform designed for startup sales teams. Styled with a high-end, responsive dark-mode SaaS interface, it brings modern workflow aesthetics (inspired by Linear and HubSpot) to everyday pipeline tracking. 

The application is built with a decoupled monorepo architecture: a React + TypeScript frontend client and a Node.js + Express + Prisma backend API connected to a serverless PostgreSQL database.

---

## 🚀 Key Features

* **📊 Dashboard**: Real-time sales statistics, charts (Area/Pie), activity logs, administrative console, and calculated AI insights.
* **📋 Lead Pipeline (Kanban Board)**: Drag-and-drop lead cards across pipeline stages (*New, Contacted, Qualified, Proposal Sent, Negotiation, Won, Lost*) with automatic score recalculation.
* **🤖 AI CRM Copilot Sidebar (Lead Profiles)**:
  * **AI Lead Scoring**: Probability metric based on company size, engagement history, and source.
  * **AI Summary**: 2-4 sentence briefing of client communications and objections.
  * **AI Next Best Action**: Recommends next steps based on lead prioritization.
  * **AI Email Drafter**: Select and generate customizable email templates (*First Contact, Follow-up, Proposal, Thank You, Meeting Reminder, Re-engagement*).
  * **AI Meeting Scribe**: Converts raw shorthands and transcripts into structured action registers.
* **🧠 Central AI CRM Workspace**: Dedicated center to synthesize summaries, write outreach copy, parse transcripts, run NLP-filtered queries, and review system insights.
* **🛡️ Security & Roles**: Restricted route guards. Only **Administrators** can assign reps, delete records, view audit logs, or edit settings.

---

## 🛠️ Technology Stack

### Frontend Client
* **Framework**: React 19 + TypeScript
* **Styling**: Tailwind CSS + Framer Motion (premium glassmorphic cards and micro-animations)
* **State & Fetching**: TanStack React Query + React Hook Form
* **Charts**: Recharts (interactive pipeline distribution)

### Backend API
* **Runtime**: Node.js + Express
* **Database client**: Prisma ORM
* **Database**: PostgreSQL (Neon Serverless)
* **Auth**: JWT Access tokens + Secure HTTP-only refresh cookies
* **Security**: Helmet, CORS policies, Express Rate-Limiters

---

## 📁 Repository Structure

```text
LeadFlow-CRM/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Prisma DB schema & model definitions
│   │   └── seed.ts              # Seeding script for demo admin/sales users
│   ├── src/
│   │   ├── config/              # JWT variables, prisma client
│   │   ├── controllers/         # Handles endpoints and routes callbacks
│   │   ├── middleware/          # Auth guards, role authorization, rate-limiters
│   │   ├── repositories/        # Direct database Prisma query bindings
│   │   ├── services/            # Business logic & AI algorithms
│   │   ├── routes/              # Express API endpoints mapping
│   │   ├── tests/               # Offline integration test suites
│   │   ├── app.ts               # App settings (CORS, middleware)
│   │   └── server.ts            # App startup entry point
│   ├── tsconfig.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # Layout, ProtectedRoute, CommandPalette
│   │   ├── contexts/            # AuthContext, ThemeContext, NotificationContext
│   │   ├── pages/               # Views (Dashboard, Kanban Board, AIWorkspace, Settings)
│   │   ├── services/            # Custom API client with automatic token refreshing
│   │   ├── index.css            # Custom typography and styles
│   │   ├── App.tsx              # Child routes registration
│   │   └── main.tsx             # DOM entry
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
└── README.md
```

---

## 💻 Local Installation & Setup

### 1. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your local `.env` variables:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://neondb_owner:npg_NKBqA0jHiVU4@ep-square-sky-ax2lg4g1.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
   JWT_SECRET="leadflow-crm-access-token-secret-key-12345"
   JWT_REFRESH_SECRET="leadflow-crm-refresh-token-secret-key-54321"
   FRONTEND_URL="http://localhost:5173"
   NODE_ENV="development"
   ```
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Seed database with demo accounts:
   ```bash
   npm run prisma:seed
   ```
6. Launch dev server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch frontend dev server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

---

## 🧪 Running Integration Tests
To run the offline Jest integration test suite verifying authentication cookies, role checks, and CRUD validation:
```bash
cd backend
npm run test
```

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@gmail.com` | `AdminPassword123!` | Full control over system config & assignments |
| **Sales Rep** | `sales@leadflow.com` | `SalesPassword123!` | Lead updates, Board tracking, AI tools |

---

## 🤖 AI Usage Declaration
AI technologies were used collaboratively in this project to accelerate:
* Structuring the glassmorphic dark-theme components.
* Refactoring native dependency wrappers (`bcrypt` ➡️ `bcryptjs`) for Linux architecture compatibility.
* Documenting API endpoints and code documentation.
