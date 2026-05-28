# TicketOps Enterprise — Angular Frontend

> **Enterprise-grade support ticketing system** built with Angular 18, standalone components, signals, Angular Material, and a custom dark theme. Modeled after Jira, ServiceNow, and Freshservice.

---

## 🏗️ Architecture Overview

```
src/
├── app/
│   ├── core/                         # Singleton services, guards, interceptors
│   │   ├── guards/
│   │   │   ├── auth.guard.ts         # JWT authentication gate
│   │   │   ├── unauth.guard.ts       # Redirect logged-in users away from login
│   │   │   └── role.guard.ts         # Admin + project-access guards
│   │   ├── interceptors/
│   │   │   ├── jwt.interceptor.ts    # Attaches Bearer token, handles 401/403
│   │   │   └── loading.interceptor.ts # Global loading bar
│   │   ├── models/
│   │   │   └── models.ts             # All TypeScript interfaces and domain types
│   │   └── services/
│   │       ├── auth.service.ts       # Auth state via Angular Signals
│   │       ├── project.service.ts    # Projects CRUD + assignment
│   │       ├── employee.service.ts   # Employees CRUD
│   │       ├── ticket.service.ts     # Tickets with filters + SLA
│   │       ├── dashboard.service.ts  # Dashboard stats + trends
│   │       ├── sla.service.ts        # Shifts + SLA configs + business-hours calc
│   │       ├── report.service.ts     # Reports + CSV export
│   │       ├── toast.service.ts      # Snackbar notifications
│   │       └── loading.service.ts    # Loading state via signals
│   │
│   ├── layouts/
│   │   └── main-layout/
│   │       ├── main-layout.component.ts   # Shell: sidebar + navbar + content
│   │       ├── sidebar/
│   │       │   └── sidebar.component.ts   # Collapsible sidebar, RBAC nav items
│   │       └── navbar/
│   │           └── navbar.component.ts    # Top bar: project switcher + profile dropdown
│   │
│   ├── features/
│   │   ├── auth/login/
│   │   │   └── login.component.ts         # JWT login page
│   │   ├── dashboard/
│   │   │   └── dashboard.component.ts     # Project-specific KPI cards + charts
│   │   ├── tickets/
│   │   │   ├── ticket-list/               # Table with advanced filters + pagination
│   │   │   ├── ticket-form/               # Create / Edit ticket form
│   │   │   └── ticket-detail/             # Full detail + SLA timer + quick actions
│   │   ├── config/
│   │   │   ├── projects/                  # Project CRUD with modal
│   │   │   ├── employees/                 # Employee CRUD + project assignment
│   │   │   ├── project-auth/              # Authorization mapping
│   │   │   ├── shifts/                    # Shift management + day picker
│   │   │   └── sla/                       # SLA config per priority
│   │   ├── reports/
│   │   │   └── reports.component.ts       # Trends + SLA + employee perf tabs
│   │   ├── profile/
│   │   │   └── profile.component.ts       # User profile + password change
│   │   └── errors/
│   │       ├── forbidden.component.ts     # 403 page
│   │       └── not-found.component.ts     # 404 page
│   │
│   ├── app.config.ts    # ApplicationConfig with providers
│   ├── app.routes.ts    # Full lazy-loaded route tree
│   └── app.component.ts # Root <router-outlet>
│
├── environments/
│   ├── environment.ts       # Dev: http://localhost:8080/api
│   └── environment.prod.ts  # Prod: /api (reverse proxy)
│
├── styles.css               # Global dark enterprise theme (CSS variables)
└── index.html
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Angular CLI 18+

### Install and run
```bash
npm install
ng serve --open
```

App runs at `http://localhost:4200`

### Build for production
```bash
ng build --configuration=production
```

---

## 🔐 Authentication Flow

1. `POST /api/auth/login` → returns `{ token, user }` (JWT + user metadata)
2. Token stored in `localStorage` via `AuthService` (signal-based)
3. `jwtInterceptor` attaches `Authorization: Bearer <token>` to every request
4. `authGuard` protects all main routes; `unauthGuard` redirects logged-in users away from `/auth/login`
5. 401 responses auto-logout; 403 responses redirect to `/forbidden`

---

## 🏢 Project-Wise Business Flow

```
ADMIN creates Projects  →  ADMIN creates Employees  →  ADMIN assigns Employees to Projects
                                                               ↓
                                             Employees log in and see ONLY assigned projects
                                                               ↓
                                             Project Switcher in navbar refreshes:
                                             Dashboard / Tickets / Reports
                                                               ↓
                                             Tickets belong to a Project
                                             Employees can only view/update project tickets
```

---

## 👥 Role-Based Access Control

| Role              | Dashboard | Tickets         | Config | Reports |
|-------------------|-----------|-----------------|--------|---------|
| `ADMIN`           | All       | All             | Full   | All     |
| `PROJECT_MANAGER` | Own       | Assigned proj.  | None   | Own     |
| `L1_SUPPORT`      | Own       | Assigned proj.  | None   | None    |
| `L2_SUPPORT`      | Own       | Assigned proj.  | None   | None    |
| `USER`            | Own       | Own tickets     | None   | None    |

Guards used: `authGuard`, `adminGuard`, `projectAccessGuard`

---

## ⏱️ SLA & Business Hours Logic

Resolution time is calculated in **business hours only**:

```
Shift: 09:00 → 18:00, Mon–Fri

Ticket raised: Friday 17:00
Resolved:      Monday 11:00

Calculation:
  Friday  17:00 → 18:00  =  1h
  Monday  09:00 → 11:00  =  2h
  ─────────────────────────────
  Total business resolution = 3h
```

Frontend `SlaService.calculateBusinessHours()` implements this logic for display. The backend provides pre-calculated `businessResolutionHours` and `slaRemainingHours`.

---

## 🌐 API Base URL

| Environment | Base URL                  |
|-------------|---------------------------|
| Development | `http://localhost:8080/api` |
| Production  | `/api` (reverse proxy)     |

Configure in `src/environments/environment.ts`.

---

## 📡 API Endpoints Expected

### Auth
| Method | Endpoint          | Description          |
|--------|-------------------|----------------------|
| POST   | `/auth/login`     | JWT login            |
| POST   | `/auth/register`  | New user             |
| GET    | `/auth/me`        | Current user info    |

### Projects
| Method | Endpoint                             | Description                |
|--------|--------------------------------------|----------------------------|
| GET    | `/projects/list`                     | All projects (flat list)   |
| GET    | `/projects/my`                       | Projects for current user  |
| GET    | `/projects`                          | Paginated project list     |
| POST   | `/projects`                          | Create project             |
| PUT    | `/projects/:id`                      | Update project             |
| DELETE | `/projects/:id`                      | Delete project             |
| PATCH  | `/projects/:id/toggle-status`        | Activate/Deactivate        |
| GET    | `/projects/:id/employees`            | Get project employees      |
| POST   | `/projects/:id/employees`            | Assign employees           |
| DELETE | `/projects/:id/employees/:empId`     | Remove employee            |
| GET    | `/projects/:id/authorizations`       | Get auth mappings          |
| PUT    | `/projects/:id/authorizations/:empId`| Update role mapping        |

### Employees
| Method | Endpoint                      | Description             |
|--------|-------------------------------|-------------------------|
| GET    | `/employees`                  | Paginated               |
| GET    | `/employees/list`             | Flat list               |
| POST   | `/employees`                  | Create                  |
| PUT    | `/employees/:id`              | Update                  |
| DELETE | `/employees/:id`              | Delete                  |
| PATCH  | `/employees/:id/toggle-status`| Activate/Deactivate     |
| POST   | `/employees/:id/projects`     | Assign projects         |

### Tickets
| Method | Endpoint                      | Description                |
|--------|-------------------------------|----------------------------|
| GET    | `/tickets`                    | Paginated + filters        |
| GET    | `/tickets/:id`                | By ID                      |
| POST   | `/tickets`                    | Create                     |
| PUT    | `/tickets/:id`                | Update                     |
| DELETE | `/tickets/:id`                | Delete                     |
| PATCH  | `/tickets/:id/assign`         | Assign employee            |
| PATCH  | `/tickets/:id/status`         | Update status              |
| GET    | `/tickets/my`                 | Current user's tickets     |

### Dashboard
| Method | Endpoint                  | Description             |
|--------|---------------------------|-------------------------|
| GET    | `/dashboard/stats`        | KPI summary             |
| GET    | `/dashboard/trends`       | Ticket trend data       |
| GET    | `/dashboard/performance`  | Employee performance    |
| GET    | `/dashboard/priority-dist`| Priority distribution   |

### Shifts
| Method | Endpoint       | Description |
|--------|----------------|-------------|
| GET    | `/shifts`      | All shifts  |
| POST   | `/shifts`      | Create      |
| PUT    | `/shifts/:id`  | Update      |
| DELETE | `/shifts/:id`  | Delete      |

### SLA
| Method | Endpoint           | Description        |
|--------|--------------------|--------------------|
| GET    | `/sla/configs`     | Get SLA configs    |
| POST   | `/sla/configs`     | Upsert SLA config  |
| GET    | `/sla/report`      | SLA breach report  |

### Reports
| Method | Endpoint               | Description             |
|--------|------------------------|-------------------------|
| GET    | `/reports/project`     | Project-wise report     |
| GET    | `/reports/sla`         | SLA report              |
| GET    | `/reports/employee`    | Employee performance    |
| GET    | `/reports/trends`      | Volume trends           |
| GET    | `/reports/export/:type`| CSV export (Blob)       |

---

## 🎨 Theme Customization

All colors are CSS variables in `src/styles.css`. To switch to a light theme or brand colors, override the `:root` block:

```css
:root {
  --bg-primary:  #f4f6f9;
  --bg-card:     #ffffff;
  --accent:      #4f46e5;   /* your brand color */
  --text-primary: #111827;
  /* ... */
}
```

---

## 📦 Key Dependencies

| Package              | Purpose                           |
|----------------------|-----------------------------------|
| `@angular/material`  | UI components (dialog, snackbar)  |
| `@angular/cdk`       | CDK primitives                    |
| `chart.js`           | Charts (ready to integrate)       |
| `rxjs`               | Reactive streams                  |

---

## ✅ Features Checklist

- [x] JWT Authentication + refresh token handling
- [x] Role-based route guards (ADMIN, PM, L1, L2, USER)
- [x] Project switcher in navbar (signal-based)
- [x] Project-specific dashboard KPIs
- [x] Ticket management (create, edit, view, delete, assign, status)
- [x] Advanced ticket filters (project, priority, status, SLA, date, employee)
- [x] SLA countdown + breach indicators
- [x] Business-hours-based resolution time display
- [x] Configuration module (Projects, Employees, Authorization, Shifts, SLA)
- [x] Project Authorization mapping (employee ↔ project ↔ role)
- [x] Shift management with day picker and time inputs
- [x] SLA per-priority configuration with escalation
- [x] Reports (trends, SLA, employee performance) with CSV export
- [x] User profile + password change
- [x] Responsive sidebar (collapsible, mobile-friendly)
- [x] Global loading interceptor + progress bar
- [x] Toast notifications (success, error, warning, info)
- [x] Empty states + skeleton loaders
- [x] 403 Forbidden + 404 Not Found error pages
- [x] Lazy-loaded routes (all feature modules)
- [x] Angular Signals throughout (auth state, UI state, loading)
- [x] Standalone components (no NgModules)
- [x] Full TypeScript typing (strict mode)
- [x] Enterprise dark theme with CSS variables
