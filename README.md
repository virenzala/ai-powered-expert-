# ExportFlow — AI-Powered Export Outreach Automation

ExportFlow is a full-stack, enterprise-grade B2B SaaS web application designed for export businesses to discover, import, clean, validate, qualify, classify, personalize, approve, send, track, and follow up with international buyer leads.

Designed for industrial use cases such as:
- Industrial Machinery & Valves
- Submersible Slurry Pumps
- High Voltage Transformers & Electrical Equipment
- CNC Components & Precision Gears
- Hydraulic Fittings & Flanges

---

## 🌟 Key Features

1. **Role-Based Authentication**: JWT-authenticated authorization for Admin (Full controls), Manager (Approvals & Campaigns), and Sales User (Outreach & Drafts).
2. **Dynamic Executive Dashboard**: Live KPI cards, 6-stage lead acquisition funnel, active campaign status, follow-ups due today, and recent audit activity feed.
3. **Buyer Lead & Company Management**: Powerful multi-filter data table with search, sorting, pagination, multi-select bulk actions (Validate, AI Score, Suppress, Export CSV).
4. **CSV/Excel Lead Import Wizard**: Interactive 3-step import wizard with auto-suggested column mapping, dry-run preview, and duplicate detection engine (Email, Company+Website, Phone).
5. **Email Validation Service Adapter**: Deliverability safety engine classifying emails into Valid, Invalid, Risky, Unknown, or Disposable.
6. **AI Lead Classification & Scoring**: AI engine scoring leads (0-100) based on product relevance, country fit, buyer type, and completeness with transparent reasoning.
7. **AI Email Personalization & Template Engine**: Reusable templates with variables (`{{company_name}}`, `{{contact_name}}`, `{{product_name}}`, etc.) and AI draft generator.
8. **Campaign Management & Manager Approval Gate**: Workflow state machine requiring explicit Manager sign-off before campaign emails can be sent.
9. **Gmail Integration & Controlled Dispatcher**: Gmail OAuth 2.0 integration with daily rate-limiting and pre-send safety checks (Validation, Suppression, Duplicate check).
10. **Follow-Up Task Center**: Scheduled follow-up tasks with priority badges and completion tracking.
11. **Suppression / Opt-Out List**: Global compliance exclusion list blocking pre-sent emails automatically.
12. **Analytics & Reports**: Visual charts using Recharts for lead country distribution, validation quality, and buyer type breakdown.
13. **Audit Trail**: Detailed activity logs capturing system and user actions.

---

## 🏗️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React Icons, Recharts, React Router DOM, TanStack Query, React Hook Form, Zod.
- **Backend**: Node.js, Express.js, TypeScript, REST API, JWT Authentication, Bcrypt.js, Mongoose ORM.
- **Database**: MongoDB (with automatic fallback to embedded `mongodb-memory-server` if local MongoDB daemon is offline).
- **Service Adapters**: High-intelligence mock adapters with active settings toggles for real Google OAuth, OpenAI/Gemini, and Hunter/ZeroBounce credentials.

---

## 🚀 Quick Start Guide

### 1. Installation
```bash
npm run install:all
```

### 2. Seed Database
Populate realistic B2B export buyer leads, companies, templates, and active campaigns:
```bash
npm run seed
```

### 3. Run Development Servers
Start backend API (port 5000) and frontend client (port 3000):
```bash
# Terminal 1 (Backend API)
npm run dev:server

# Terminal 2 (Frontend Client)
npm run dev:client
```

### 4. Run Automated API Tests
```bash
npm run test:server
```

---

## 🔑 Demo Account Credentials

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@exportflow.com` | `password123` | Full access, user management, settings |
| **Manager** | `manager@exportflow.com` | `password123` | Lead management, campaign approvals, reports |
| **Sales** | `sales@exportflow.com` | `password123` | Lead management, assigned campaigns, follow-ups |

---

## 📂 Project Layout

```text
ExportFlow/
├── client/                 # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/     # UI primitives & feature components (leads, campaigns, etc.)
│   │   ├── context/        # Auth & Toast Context Providers
│   │   ├── pages/          # Page view components (Dashboard, Leads, Import, etc.)
│   │   ├── services/       # Axios API client
│   │   └── types/          # TypeScript interface definitions
├── server/                 # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/         # DB connection & Zod environment schema
│   │   ├── controllers/    # Express REST route controllers
│   │   ├── middleware/     # Auth JWT, Role authorization, Zod validation
│   │   ├── models/         # Mongoose schemas (Lead, Company, Campaign, etc.)
│   │   ├── routes/         # Express router endpoints
│   │   ├── seed/           # Seed runner & sample export data
│   │   ├── services/       # AI, Validation, Gmail, & Import service adapters
│   │   └── tests/          # Automated integration test suite
```
