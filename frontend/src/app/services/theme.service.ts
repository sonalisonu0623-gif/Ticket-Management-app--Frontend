import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _theme = signal<'dark' | 'light'>('dark');
  theme = this._theme.asReadonly();

  constructor() {
    // Always dark for enterprise theme
    this._theme.set('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  toggle(): void {
    const next = this._theme() === 'dark' ? 'light' : 'dark';
    this._theme.set(next);
    document.documentElement.setAttribute('data-theme', next);
  }

  isDark(): boolean { return this._theme() === 'dark'; }
}
