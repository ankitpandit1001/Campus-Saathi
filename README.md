# CampusFix | College Issue & Complaint Management Platform

> **Final-Year B.Tech CSE Major Project**  
> A complete, functional, production-style college complaint management and campus infrastructure maintenance platform built with React, Express, Prisma, and PostgreSQL.

---

## 1. Project Overview & Problem Statement

College campuses often span dozens of departments, multi-story academic blocks, science laboratories, hostels, libraries, dining halls, and sports complexes. Across these facilities, infrastructure problems arise daily:
- Flickering classroom projectors, burnt switchboards, or power tripping during lab hours.
- Water cooler leakages creating slip hazards in hostel corridors.
- Wi-Fi deadzones in library reference sections during exams.
- Broken washroom fixtures and damaged furniture in lecture halls.

Traditionally, students reported issues through physical registers, informal WhatsApp messages, or verbal requests to peons. These methods suffered from severe limitations:
- **Zero Visibility:** Students never knew if their complaint reached the right technician or was forgotten.
- **Lack of Accountability:** Maintenance staff had no clear work queues, SLA deadlines, or performance records.
- **No Institutional Intelligence:** Administrators could not track recurring faults, frequent breakdown areas, or response delays.

**CampusFix** solves this by establishing a centralized, transparent, and auditable digital workflow connecting **Students**, **Maintenance Staff**, and **College Administration**.

---

## 2. Main Objectives

1. **Empower Students:** Provide an intuitive portal to report campus infrastructure problems with photos, location tags, and priority levels, and follow their status in real time.
2. **Streamline Maintenance Operations:** Enable technicians to receive dispatched tasks, review location details, log progress notes, and confirm resolutions.
3. **Institutional Accountability:** Provide administrators with an automated assignment desk, category-specific SLA monitoring (e.g. 12h for sanitation, 24h for electricity), overdue escalation alerts, and visual analytics.
4. **Data-Driven Governance:** Deliver real-time charts on breakdown categories, resolution velocity, technician workloads, and 1-click CSV report exports.

---

## 3. User Roles & Permissions Matrix

CampusFix enforces Role-Based Access Control (RBAC) at both the API level and the frontend UI:

| Feature / Capability | Student | Staff Member | Administrator |
|---|:---:|:---:|:---:|
| Register and login | ✅ | Admin approved | Pre-configured |
| Submit complaints with photo attachment | ✅ | ❌ | ❌ |
| View own submitted complaints | ✅ | ❌ | ✅ (All) |
| View complaints submitted by other students | ❌ (Strictly blocked) | ❌ (Strictly blocked) | ✅ |
| Track status timeline & add comments | ✅ | ✅ (Assigned only) | ✅ |
| Reopen resolved complaint with reason | ✅ | ❌ | ❌ |
| View assigned technician work queue | ❌ | ✅ | ✅ |
| Update status to `In Progress` & `Resolved` | ❌ | ✅ (Assigned only) | ✅ |
| Dispatch / assign complaints to staff | ❌ | ❌ | ✅ |
| Reject invalid / duplicate complaints | ❌ | ❌ | ✅ (With reason) |
| Manage complaint categories & SLA hours | ❌ | ❌ | ✅ |
| Create & activate/deactivate staff accounts | ❌ | ❌ | ✅ |
| System analytics, KPI charts & CSV export | ❌ | ❌ | ✅ |
| Immutable system audit logs | ❌ | ❌ | ✅ |

---

## 4. Technology Stack

### Frontend
- **Framework:** React.js (v18.3) with Vite bundler
- **Styling:** Tailwind CSS with customized brand palette, smooth transitions, and responsive grid
- **Routing:** React Router DOM (v6) with declarative role-based route guards
- **HTTP Client:** Axios with request interceptors for Bearer tokens and response interceptors for session validation
- **Data Visualization:** Recharts (Bar charts, Pie charts, Line charts)
- **Icons:** Lucide React
- **Notifications:** In-app Notification center with unread badges + custom Toast provider

### Backend
- **Runtime:** Node.js (v18+ or v22)
- **Web Framework:** Express.js (v4.19)
- **Database ORM:** Prisma ORM (v5.22)
- **Primary Database:** PostgreSQL
- **Local Fallback Engine:** SQLite (zero-config, zero-dependency instant testing)
- **Authentication:** JWT (JSON Web Tokens) with HS256 algorithm and expiration validation
- **Password Security:** Memory-hard Bcrypt hashing (10 salt rounds)
- **Input Validation:** Zod schema validation
- **File Uploads:** Multer with UUID randomized filenames, MIME-type allowlist (JPEG, PNG, WebP), and 5MB size limit
- **API Security:** Helmet security headers, CORS with strict allowed origins, and express-rate-limit brute force protection
- **Data Export:** CSV generation with formula injection sanitization

---

## 5. Complaint Lifecycle & Workflow

```
[Student Submits Issue]
         │
         ▼
    (SUBMITTED) ──► Initial status, unique ID generated (CF-YYYY-XXXX)
         │
         ├───► Admin Reviews: can REJECT with mandatory explanation ──► (REJECTED)
         │
         ▼
  (UNDER REVIEW)
         │
         ▼
    (ASSIGNED) ────► Dispatched to technician; in-app notification sent
         │
         ▼
  (IN PROGRESS) ──► Staff commences on-site diagnosis and repair
         │
         ▼
   (RESOLVED) ────► Staff documents resolution summary & tests repair
         │
         ├───► Student verifies: Issue recurred? ──► REOPEN with reason ──► (REOPENED)
         │
         ▼
    (CLOSED) ─────► Permanently archived into college records
```

---

## 6. Project Directory Structure

```
CampusFix/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # Badges, Modals, EmptyState, Pagination, LoadingSpinner
│   │   │   ├── complaints/     # ComplaintCard, StatusTimeline
│   │   │   └── layout/         # Navbar (notifications dropdown), Sidebar (role links)
│   │   ├── context/            # AuthContext, NotificationContext, ToastContext
│   │   ├── layouts/            # DashboardLayout, AuthLayout
│   │   ├── pages/
│   │   │   ├── public/         # LandingPage, LoginPage, RegisterPage, ErrorPages
│   │   │   ├── student/        # StudentDashboard, SubmitComplaint, MyComplaints, ComplaintDetail, StudentProfile
│   │   │   ├── staff/          # StaffDashboard, AssignedComplaints, StaffComplaintDetail, StaffStats
│   │   │   └── admin/          # AdminDashboard, AllComplaints, CategoryManagement, UserManagement, AnalyticsReports, AuditLogs, AdminProfile
│   │   ├── services/           # Axios api client configuration
│   │   ├── App.jsx             # Route definitions & ProtectedRoute guards
│   │   ├── index.css           # Tailwind directives & typography
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Express.js REST API Backend
│   ├── prisma/
│   │   ├── schema.prisma       # Normalized PostgreSQL schema
│   │   ├── schema.sqlite.prisma# SQLite zero-dependency schema
│   │   ├── setup-db.js         # Automated schema push & seed runner
│   │   └── seed.js             # Demo accounts & realistic complaints seed script
│   ├── src/
│   │   ├── controllers/        # auth, complaint, staff, admin, notification controllers
│   │   ├── middleware/         # authMiddleware, rbacMiddleware, upload, validate, rateLimiter, errorHandler
│   │   ├── routes/             # authRoutes, complaintRoutes, staffRoutes, adminRoutes, notificationRoutes
│   │   ├── services/           # auditService, notificationService
│   │   ├── utils/              # prisma, jwt, password, complaintId, csv
│   │   ├── validators/         # Zod schemas (auth, complaint, admin)
│   │   ├── app.js              # Express app, helmet, CORS, error handling
│   │   └── server.js           # Express listener
│   ├── tests/                  # Integration test suite (Supertest + Vitest)
│   ├── uploads/                # Uploaded photos storage (served securely)
│   └── package.json
├── .env.example                # Template configuration values
├── .gitignore
├── package.json                # Root concurrent scripts
└── README.md                   # Complete documentation
```

---

## 7. Database Architecture (Prisma Schema)

The database schema models the institutional complaint workflow with strict foreign key constraints and audit integrity:

1. **`User`**: Accounts for Students, Staff, and Admins (`role: STUDENT | STAFF | ADMIN`). Stores hashed passwords, department, roll number, phone, and `isActive` flag.
2. **`ComplaintCategory`**: Campus breakdown categories (`Electrical`, `Plumbing`, `Wi-Fi`, `Classroom & Labs`, `Washroom`, `Hostel Facilities`, `HVAC`). Configurable `slaHours`.
3. **`Complaint`**: Central entity with human-friendly `complaintNumber` (e.g., `CF-2026-0001`), title, description, location, roomNumber, priority (`LOW`, `MEDIUM`, `HIGH`), status, image attachment URL, resolution summary, and reopen/rejection reasons.
4. **`ComplaintAssignment`**: Records dispatch of a complaint to a technician by an administrator with timestamp and notes.
5. **`ComplaintComment`**: Threaded discussion updates between students and staff, supporting `isInternal` technician-only notes.
6. **`ComplaintStatusHistory`**: Immutable timestamped transition log capturing `oldStatus`, `newStatus`, `changedById`, and notes.
7. **`Notification`**: In-app notifications delivering alerts on status transitions, new assignments, comments, and resolutions.
8. **`AuditLog`**: System audit trail capturing sensitive administrative actions, entity IDs, IP addresses, and timestamps.

---

## 8. Prerequisites

- **Node.js**: v18.0.0 or higher (Tested on Node v22)
- **NPM**: v9.0.0 or higher
- **PostgreSQL** (Optional for local test; SQLite is included out-of-the-box for instant zero-dependency demonstration)

---

## 9. Environment Setup

Copy `.env.example` to `server/.env` or configure root `.env`:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Authentication Secrets
JWT_SECRET=campusfix_super_secure_jwt_secret_key_2026_cse_project_dev_only
JWT_EXPIRES_IN=24h

# Database Configuration
# Primary PostgreSQL URL:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campusfix?schema=public"

# Database Provider Toggle: 'postgresql' or 'sqlite'
DB_PROVIDER=sqlite
SQLITE_DATABASE_URL="file:./dev.db"

# Uploads
MAX_FILE_SIZE_MB=5
UPLOAD_DIR=./uploads
```

### PostgreSQL Setup (Production or Local Postgres)
1. Install PostgreSQL and create a database named `campusfix`:
   ```sql
   CREATE DATABASE campusfix;
   ```
2. In `server/.env`, set `DB_PROVIDER=postgresql` and specify your credentials:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/campusfix?schema=public"
   DB_PROVIDER=postgresql
   ```
3. Run Prisma migration:
   ```bash
   cd server
   npx prisma migrate dev --name init
   npm run seed
   ```

### Zero-Config Instant Setup (Default)
If you don't have PostgreSQL installed on your machine or want to run the project immediately for a project presentation:
1. Keep `DB_PROVIDER=sqlite` in `server/.env`.
2. Run `npm run db:setup` inside `server/`. This automatically initializes `dev.db` and populates all fictional demo records!

---

## 10. Installation & Running Locally

### Step 1: Install Dependencies
From the root directory:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

### Step 2: Initialize Database & Demo Data
```bash
cd server
npm run db:setup
cd ..
```

### Step 3: Start the Backend Server
```bash
cd server
npm run dev
# Server will start on http://127.0.0.1:5000
```

### Step 4: Start the Frontend Client
In a new terminal window:
```bash
cd client
npm run dev
# Vite client will launch on http://127.0.0.1:5173
```

Open your browser at **`http://127.0.0.1:5173`**.

---

## 11. Pre-Configured Demo Accounts

For fast evaluation and demonstration, the login page includes **1-click auto-fill buttons** for each role:

| Role | Email | Password | Access & Responsibilities |
|---|---|---|---|
| **Administrator** | `admin@campusfix.edu` | `Admin@123` | Full control, assignment desk, analytics, user management, audit logs |
| **Maintenance Staff** | `anita.network@campusfix.edu` | `Staff@123` | Network & IT technician: view assigned queue, mark in progress & resolved |
| **Maintenance Staff** | `suresh.plumb@campusfix.edu` | `Staff@123` | Plumbing & water supply technician: view assigned hostel tasks |
| **Maintenance Staff** | `rajesh.electric@campusfix.edu` | `Staff@123` | Electrical maintenance technician |
| **Student** | `rahul.sharma@campusfix.edu` | `Student@123` | Computer Science student: lodge complaints, upload photos, add comments |
| **Student** | `priya.patel@campusfix.edu` | `Student@123` | Electronics student: view resolved tickets |
| **Student** | `arjun.kumar@campusfix.edu` | `Student@123` | Mechanical student: test reopened complaint workflow |

---

## 12. REST API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Student registration with input validation
- `POST /api/auth/login` - Authenticate user, issue JWT token & set HttpOnly cookie
- `POST /api/auth/logout` - Clear auth session cookie & record audit logout
- `GET /api/auth/me` - Fetch authenticated user profile
- `PATCH /api/auth/profile` - Update student or staff profile details
- `POST /api/auth/change-password` - Securely change account password

### Complaints (`/api/complaints`)
- `POST /api/complaints` - Lodge a complaint with optional image upload (Multipart)
- `GET /api/complaints` - Query complaints (isolated by role; search, filter, paginate)
- `GET /api/complaints/:id` - Fetch single complaint with timeline and comments
- `POST /api/complaints/:id/comments` - Post comment on complaint
- `POST /api/complaints/:id/reopen` - Reopen resolved complaint with mandatory explanation
- `GET /api/complaints/:id/history` - Fetch full timestamped status lifecycle audit history

### Staff Workflows (`/api/staff`)
- `GET /api/staff/complaints` - Retrieve complaints dispatched to logged-in technician
- `PATCH /api/staff/complaints/:id/status` - Transition status to `IN_PROGRESS` or `RESOLVED` (with resolution summary)
- `POST /api/staff/complaints/:id/notes` - Add technician progress notes (internal or public)
- `GET /api/staff/stats` - Fetch personal workload and resolution rate statistics

### Administration (`/api/admin`)
- `GET /api/admin/dashboard` - Top KPIs, charts (category, priority, trends, workload)
- `PATCH /api/admin/complaints/:id/assign` - Dispatch complaint to staff member
- `PATCH /api/admin/complaints/:id/status` - Transition status or reject with explanation
- `GET /api/admin/users` - Paginated user directory with role & search filters
- `POST /api/admin/users/staff` - Create new technician staff account
- `PATCH /api/admin/users/:id/status` - Activate or deactivate account
- `GET /api/admin/categories` - Fetch all complaint categories and SLA hours
- `POST /api/admin/categories` - Create new category
- `PATCH /api/admin/categories/:id` - Update category SLA or description
- `GET /api/admin/reports/export` - Export complaint records to sanitized CSV
- `GET /api/admin/audit-logs` - Inspect system security audit records

### In-App Notifications (`/api/notifications`)
- `GET /api/notifications` - Retrieve user notifications with unread count
- `PATCH /api/notifications/:id/read` - Mark single notification as read
- `POST /api/notifications/mark-all-read` - Mark all user notifications as read

---

## 13. Automated Testing & Verification

The project includes an automated test suite verifying security, authentication, and core complaint lifecycle workflows:

```bash
cd server
npm test
```

### Verified Test Cases (17 Passing Tests):
1. Student account registration with input validation.
2. Rejection of invalid credentials on login.
3. Role-Based Access Control: Students blocked from `/api/admin/dashboard` with 403 Forbidden.
4. Role-Based Access Control: Administrators authorized to access KPI metrics.
5. Complaint input validation: Rejection of short titles/descriptions.
6. Unique complaint number generation adhering to `CF-YYYY-XXXX` format.
7. Multi-tenant Student Data Isolation: Student B blocked from viewing Student A's ticket (403).
8. Complaint owner authorized to view their own ticket (200).
9. Administrator dispatching complaint to technician with audit recording.
10. Immutable status history entries preserved after state transitions.
11. Staff member access control: Unassigned technicians blocked from updating tickets (403).
12. Assigned technicians authorized to update status to `IN_PROGRESS`.
13. Assigned technicians marking tickets as `RESOLVED` with required resolution summary.
14. Student reopening resolved complaints with documented justification.
15. Triggering in-app notifications on status changes.
16. Unauthorized users blocked from CSV data export (403).
17. Administrators authorized to export sanitized CSV reports (200, `text/csv`).

To verify frontend production bundle compilation:
```bash
cd client
npm run build
```

---

## 14. Common Errors & Troubleshooting

| Issue | Likely Cause | Solution |
|---|---|---|
| `Cannot connect to PostgreSQL database` | PostgreSQL daemon is stopped or credentials in `.env` are incorrect | Set `DB_PROVIDER=sqlite` in `server/.env` to run with instant zero-dependency SQLite, or verify your PostgreSQL service is running on port 5432. |
| `File upload rejected (Invalid file type)` | Uploaded file is not JPEG, PNG, or WebP | Ensure the image has a `.jpg`, `.jpeg`, `.png`, or `.webp` extension and is under 5MB. |
| `Access Denied (403) on route` | Trying to access admin or staff page with student credentials | Sign out and log in with the appropriate role (use the 1-click demo buttons on `/login`). |
| `Cannot find module '@prisma/client'` | Prisma client has not been generated yet | Run `npx prisma generate` inside the `server/` directory. |
| `CORS Error in browser console` | API base URL mismatch | Verify that `server/.env` has `CLIENT_URL=http://localhost:5173` and the backend is running on port 5000. |

---

## 15. Limitations & Future Roadmap

- **Push Notifications & WebSockets:** Currently uses polling and database notifications; future upgrades can integrate Socket.io or Web Push notifications for real-time mobile push.
- **Campus GPS Geofencing:** Support pinpointing exact GPS coordinates on an interactive campus map.
- **SMS / WhatsApp Integration:** Dispatch automated SMS alerts to maintenance supervisors for critical high-priority emergencies (e.g. fire/spark hazards).
- **Preventative Maintenance Schedules:** Enable administrators to schedule recurring periodic inspections (e.g. quarterly AC servicing, monthly water tank cleaning).
