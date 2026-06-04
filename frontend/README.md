# TicketOps Enterprise — Frontend

Enterprise-grade Angular 17 support ticketing system built with standalone components, Angular Signals, and a pure CSS dark theme (no heavy UI libraries needed).

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Angular 17 (standalone components) |
| State | Angular Signals + service-based store |
| Routing | Angular Router with lazy loading |
| Forms | Angular Reactive Forms |
| HTTP | Angular HttpClient with functional interceptors |
| Styling | Pure CSS custom properties (zero CSS framework dependency) |
| Icons | Material Symbols Rounded (Google Fonts CDN) |
| Auth | JWT via Bearer token |

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Backend running at `http://localhost:8080`

### Install & Run

```bash
npm install
npm start          # dev server → http://localhost:4200
npm run build:prod # production build → dist/
```

### Configure API URL

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api'  // ← your backend URL
};
```

---

## Demo Accounts (backend seed data)

| Username | Password | Role |
|---|---|---|
| `admin` | `password` | Admin — full access |
| `pm_marcus` | `password` | Project Manager |
| `l1_john` | `password` | L1 Support |
| `l2_sarah` | `password` | L2 Support |
| `l3_david` | `password` | L3 Support |
| `user_test` | `password` | User (raise tickets only) |

---

## Project Structure

```
src/app/
├── core/
│   ├── guards/        authGuard, unauthGuard, adminGuard
│   ├── interceptors/  JWT + loading interceptors
│   ├── services/      AuthService, API services, ToastService, LoadingService
│   ├── state/         ProjectStore (signal-based)
│   ├── models.ts      All TypeScript interfaces
│   └── utils.ts       Shared helper functions
│
├── layouts/
│   ├── auth/          AuthLayoutComponent (full-page centered)
│   └── main/          MainLayoutComponent (sidebar + topbar)
│
├── features/
│   ├── auth/          Login, Register
│   ├── dashboard/     Project-wise KPI dashboard
│   ├── tickets/       List, Form (create/edit), Detail
│   ├── configuration/ All 5 config tabs in one component
│   ├── reports/       Analytics & performance reports
│   └── profile/       User profile & permissions
│
└── shared/
    └── components/
        ├── toast/          Toast notification container
        ├── confirm-dialog/ Reusable delete confirmation modal
        └── forbidden/      403 error page
```

---

## Key Features

### Authentication
- JWT stored in `localStorage`
- Auto-attached via `jwtInterceptor`
- Automatic redirect on 401
- Role-based route guards

### Project Switcher
- Live in the sidebar
- Switching project reloads dashboard, ticket list, and reports
- Active project stored in `localStorage` across sessions

### Dashboard
- Project-specific KPI cards (6 metrics)
- Status & priority distribution bar charts (pure CSS)
- SLA compliance ring chart (pure SVG)
- Critical P1 ticket alert panel
- Employee performance table
- Recent tickets list

### Ticket Management
- Full CRUD with paginated list
- Advanced filter panel (project, employee, priority, status, level, SLA breached)
- Debounced real-time search
- SLA remaining time indicator on every row
- Business-hours-aware SLA display

### Configuration (Admin only — 5 tabs)
1. **Project Management** — full CRUD, status toggle
2. **Employee Management** — full CRUD, multi-project assignment
3. **Project Authorization** — visual project↔employee matrix
4. **Shift Management** — weekday picker, time inputs
5. **SLA Configuration** — per-project per-priority thresholds

### Reports
- Project-scoped analytics
- Status & priority bar charts
- Employee performance table with resolution rate progress bars
- SLA compliance summary

### UX
- Global loading bar (HTTP request tracking)
- Toast notifications (success/error/warning/info)
- Confirm dialog for destructive actions
- Skeleton loaders on every data-loading screen
- Empty states with call-to-action
- Responsive sidebar (collapsible)
- Mobile-friendly responsive layout

---

## Role-Based Access

| Feature | Admin | PM | L1/L2/L3 | User |
|---|---|---|---|---|
| Configuration tabs | ✅ | ❌ | ❌ | ❌ |
| Delete tickets | ✅ | ❌ | ❌ | ❌ |
| Edit tickets | ✅ | ✅ | ✅ | ❌ |
| Create tickets | ✅ | ✅ | ✅ | ✅ |
| View dashboard | ✅ | ✅ | ✅ | ✅ |
| View reports | ✅ | ✅ | ✅ | ✅ |

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `apiBaseUrl` | `http://localhost:8080/api` | Backend API base URL |

For production, update `src/environments/environment.prod.ts`.
