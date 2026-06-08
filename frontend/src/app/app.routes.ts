import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { unauthGuard } from './guards/unauth.guard';

export const routes: Routes = [
  // Auth routes
  {
    path: 'login',
    canActivate: [unauthGuard],
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [unauthGuard],
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },

  // Protected routes
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'tickets',
        loadComponent: () => import('./components/ticket-list/ticket-list.component').then(m => m.TicketListComponent)
      },
      {
        path: 'tickets/new',
        loadComponent: () => import('./components/ticket-form/ticket-form.component').then(m => m.TicketFormComponent)
      },
      {
        path: 'tickets/edit/:id',
        loadComponent: () => import('./components/ticket-form/ticket-form.component').then(m => m.TicketFormComponent)
      },
      {
        path: 'tickets/:id',
        loadComponent: () => import('./components/ticket-detail/ticket-detail.component').then(m => m.TicketDetailComponent)
      },
      {
        path: 'configuration',
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./components/configuration/configuration.component').then(m => m.ConfigurationComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },

  { path: '**', redirectTo: '/dashboard' }
];
