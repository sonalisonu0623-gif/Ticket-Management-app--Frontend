import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'nexus-theme';
  isDark = signal<boolean>(true);

  constructor() {
    const saved = localStorage.getItem(this.THEME_KEY);
    const dark = saved !== null ? saved === 'dark' : true;
    this.isDark.set(dark);
    this.applyTheme(dark);
  }

  toggle(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    localStorage.setItem(this.THEME_KEY, next ? 'dark' : 'light');
    this.applyTheme(next);
  }

  private applyTheme(dark: boolean): void {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }
}
