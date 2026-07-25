# Digital Heroes Submission Checklist

Use this checklist to ensure all requirements are satisfied before uploading your files to Google Drive.

---

## 1. Local Workspace & Code Verification
- [x] **Monorepo Folder Structure**: Separate `backend/` and `frontend/` folders are organized.
- [x] **Unused Imports & Types Cleaned**: Zero lint warnings or unused variables in Layout and Workspace views.
- [x] **0 TypeScript Errors**:
  - Run `npm run build` in the `frontend` folder (must compile successfully).
  - Run `npm run build` in the `backend` folder (must compile successfully).
- [x] **Pure JS Bcryptjs Swap**: Replaced binary C++ `bcrypt` with `bcryptjs` to avoid Linux ELF errors during Render deploys.

---

## 2. Database & Data Seeding
- [x] **Database connection**: Connected to hosted serverless Neon PostgreSQL.
- [x] **Seed script updated**: Database seeds both `admin@leadflow.com` and `admin@gmail.com` as administrators.
- [x] **Dynamic Admin Provisioning**: Added a fallback on login to auto-register `admin@gmail.com` as `ADMIN` if database seed was cleared.

---

## 3. Production Deployments
- [x] **Backend API (Render)**: Deployed, live, and communicating with PostgreSQL database.
- [x] **Frontend static site (Vercel or Render)**: Deployed, live, and connected to the backend URL via `VITE_API_URL`.
- [x] **SPA Router Rewrites**: `vercel.json` rewrite rules (for Vercel) or Rewrite Rules (for Render) configured to support direct route reloads.

---

## 4. Deliverable Artifacts
- [x] **README.md**: Updated at root with tech stack, installation, and deployment parameters.
- [x] **Demo Credentials.txt**: Contains administrator and sales rep logins.
- [x] **Live Links.txt**: Contains the URLs to your frontend, backend, database, and repository.
- [x] **Task_B_Report.md**: Detailed technical architectural breakdown of the AI Copilot Engine.
