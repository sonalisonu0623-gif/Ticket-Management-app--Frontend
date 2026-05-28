import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ADMIN dashboard
  { path: 'dashboard', canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] },
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent) },

  // All-tickets — ADMIN + PROJECT_MANAGER
  { path: 'tickets', canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN', 'PROJECT_MANAGER'] },
    loadComponent: () => import('./components/ticket-list/ticket-list.component').then(m => m.TicketListComponent) },
  { path: 'tickets/new', canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN', 'PROJECT_MANAGER'] },
    loadComponent: () => import('./components/ticket-form/ticket-form.component').then(m => m.TicketFormComponent) },
  { path: 'tickets/edit/:id', canActivate: [AuthGuard],
    loadComponent: () => import('./components/ticket-form/ticket-form.component').then(m => m.TicketFormComponent) },
  { path: 'tickets/view/:id', canActivate: [AuthGuard],
    loadComponent: () => import('./components/ticket-detail/ticket-detail.component').then(m => m.TicketDetailComponent) },

  // My Tickets — EMPLOYEE
  { path: 'my-tickets', canActivate: [AuthGuard, RoleGuard], data: { roles: ['EMPLOYEE'] },
    loadComponent: () => import('./components/my-tickets/my-tickets.component').then(m => m.MyTicketsComponent) },

  // ── Configuration module (ADMIN only) — Projects + Employees + Shifts + SLA + Holidays ──
  { path: 'configuration', canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] },
    loadComponent: () => import('./components/configuration/configuration.component').then(m => m.ConfigurationComponent) },

  // Keep direct project/employee routes for forms (they redirect back to /configuration after save)
  { path: 'projects/new', canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN', 'PROJECT_MANAGER'] },
    loadComponent: () => import('./components/project-form/project-form.component').then(m => m.ProjectFormComponent) },
  { path: 'projects/edit/:id', canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN', 'PROJECT_MANAGER'] },
    loadComponent: () => import('./components/project-form/project-form.component').then(m => m.ProjectFormComponent) },

  { path: 'employees/new', canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] },
    loadComponent: () => import('./components/employee-form/employee-form.component').then(m => m.EmployeeFormComponent) },
  { path: 'employees/edit/:id', canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] },
    loadComponent: () => import('./components/employee-form/employee-form.component').then(m => m.EmployeeFormComponent) },

  // Legacy list routes redirect into the Configuration tab
  { path: 'employees', redirectTo: 'configuration', pathMatch: 'full' },
  { path: 'projects',  redirectTo: 'configuration', pathMatch: 'full' },
  { path: 'users',     redirectTo: 'configuration', pathMatch: 'full' },

  // Profile + Change Password — all authenticated
  { path: 'profile', canActivate: [AuthGuard],
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent) },
  { path: 'change-password', canActivate: [AuthGuard],
    loadComponent: () => import('./components/change-password/change-password.component').then(m => m.ChangePasswordComponent) },

  { path: '**', redirectTo: 'login' }
];
