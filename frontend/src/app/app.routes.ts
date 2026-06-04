import { Routes } from '@angular/router';
import { authGuard, unauthGuard, adminGuard } from './core/guards/guards';

export const routes: Routes = [
  // Auth
  {
    path: 'auth',
    canActivate: [unauthGuard],
    loadComponent: () => import('./layouts/auth/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      { path: 'login',    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  // Main App
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/main/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      // Tickets
      { path: 'tickets',         loadComponent: () => import('./features/tickets/list/ticket-list.component').then(m => m.TicketListComponent) },
      { path: 'tickets/new',     loadComponent: () => import('./features/tickets/form/ticket-form.component').then(m => m.TicketFormComponent) },
      { path: 'tickets/:id',     loadComponent: () => import('./features/tickets/detail/ticket-detail.component').then(m => m.TicketDetailComponent) },
      { path: 'tickets/:id/edit',loadComponent: () => import('./features/tickets/form/ticket-form.component').then(m => m.TicketFormComponent) },
      // Configuration (Admin only)
      {
        path: 'config',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/configuration/configuration.component').then(m => m.ConfigurationComponent)
      },
      // Reports
      { path: 'reports', loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent) },
      // Profile
      { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) }
    ]
  },
  // Error pages
  { path: 'forbidden', loadComponent: () => import('./shared/components/forbidden/forbidden.component').then(m => m.ForbiddenComponent) },
  { path: '**', redirectTo: '/dashboard' }
];
