import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _theme = signal<'dark' | 'light'>('dark');
  theme = this._theme.asReadonly();

  constructor() {
    const saved = localStorage.getItem('ticketops-theme') as 'dark' | 'light' | null;
    const initial = saved || 'dark';
    this._theme.set(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }

  toggle() {
    const next = this._theme() === 'dark' ? 'light' : 'dark';
    this._theme.set(next);
    localStorage.setItem('ticketops-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  isDark() {
    return this._theme() === 'dark';
  }
}
