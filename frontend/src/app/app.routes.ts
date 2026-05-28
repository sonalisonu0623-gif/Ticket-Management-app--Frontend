import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { unauthGuard } from './core/guards/unauth.guard';
import { adminGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // ---- Auth ----
  {
    path: 'auth',
    canActivate: [unauthGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // ---- Main app (authenticated) ----
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard'
      },

      // Tickets
      {
        path: 'tickets',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/tickets/ticket-list/ticket-list.component').then(m => m.TicketListComponent),
            title: 'Tickets'
          },
          {
            path: 'new',
            loadComponent: () => import('./features/tickets/ticket-form/ticket-form.component').then(m => m.TicketFormComponent),
            title: 'New Ticket'
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/tickets/ticket-form/ticket-form.component').then(m => m.TicketFormComponent),
            title: 'Edit Ticket'
          },
          {
            path: ':id',
            loadComponent: () => import('./features/tickets/ticket-detail/ticket-detail.component').then(m => m.TicketDetailComponent),
            title: 'Ticket Detail'
          }
        ]
      },

      // Reports
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent),
        title: 'Reports',
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PROJECT_MANAGER'] }
      },

      // Profile
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        title: 'My Profile'
      },

      // Configuration (Admin only)
      {
        path: 'config',
        canActivate: [adminGuard],
        children: [
          {
            path: '',
            redirectTo: 'projects',
            pathMatch: 'full'
          },
          {
            path: 'projects',
            loadComponent: () => import('./features/config/projects/config-projects.component').then(m => m.ConfigProjectsComponent),
            title: 'Project Management'
          },
          {
            path: 'employees',
            loadComponent: () => import('./features/config/employees/config-employees.component').then(m => m.ConfigEmployeesComponent),
            title: 'Employee Management'
          },
          {
            path: 'authorization',
            loadComponent: () => import('./features/config/project-auth/config-project-auth.component').then(m => m.ConfigProjectAuthComponent),
            title: 'Project Authorization'
          },
          {
            path: 'shifts',
            loadComponent: () => import('./features/config/shifts/config-shifts.component').then(m => m.ConfigShiftsComponent),
            title: 'Shift Management'
          },
          {
            path: 'sla',
            loadComponent: () => import('./features/config/sla/config-sla.component').then(m => m.ConfigSlaComponent),
            title: 'SLA Configuration'
          }
        ]
      },

      // Error pages
      {
        path: 'forbidden',
        loadComponent: () => import('./features/errors/forbidden.component').then(m => m.ForbiddenComponent),
        title: '403 - Forbidden'
      },
      {
        path: 'not-found',
        loadComponent: () => import('./features/errors/not-found.component').then(m => m.NotFoundComponent),
        title: '404 - Not Found'
      }
    ]
  },

  { path: 'login', redirectTo: 'auth/login' },
  { path: '**', redirectTo: '/not-found' }
];
