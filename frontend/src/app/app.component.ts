import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  sidebarCollapsed = signal(false);
  
  constructor(
    public themeService: ThemeService,
    public authService: AuthService
  ) {}

  toggleSidebar() { 
    this.sidebarCollapsed.update(v => !v); 
  }

  executeSignout() {
    this.authService.logout();
  }
}