import { Routes } from '@angular/router';
import { TicketListComponent }   from './components/ticket-list/ticket-list.component';
import { TicketFormComponent }   from './components/ticket-form/ticket-form.component';
import { TicketDetailComponent } from './components/ticket-detail/ticket-detail.component';
import { DashboardComponent }    from './components/dashboard/dashboard.component';
import { ProjectsComponent }     from './components/projects/projects.component';
import { EmployeesComponent }    from './components/employees/employees.component';

export const routes: Routes = [
  { path: '',              redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard',    component: DashboardComponent },
  { path: 'tickets',      component: TicketListComponent },
  { path: 'tickets/new',  component: TicketFormComponent },
  { path: 'tickets/edit/:id', component: TicketFormComponent },
  { path: 'tickets/:id',  component: TicketDetailComponent },
  { path: 'projects',     component: ProjectsComponent },
  { path: 'employees',    component: EmployeesComponent },
  { path: '**',           redirectTo: '/dashboard' },   // catch-all 404
];
