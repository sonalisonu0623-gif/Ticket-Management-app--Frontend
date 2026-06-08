import { Injectable, signal } from '@angular/core';
import { ToastMessage } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(toast: Omit<ToastMessage, 'id'>): void {
    const id = `t-${Date.now()}-${Math.random()}`;
    this._toasts.update(list => [...list, { ...toast, id }]);
    setTimeout(() => this.dismiss(id), toast.duration ?? 4000);
  }

  success(title: string, message?: string): void { this.show({ type: 'success', title, message }); }
  error(title: string, message?: string): void   { this.show({ type: 'error', title, message, duration: 6000 }); }
  warning(title: string, message?: string): void { this.show({ type: 'warning', title, message }); }
  info(title: string, message?: string): void    { this.show({ type: 'info', title, message }); }
  dismiss(id: string): void { this._toasts.update(list => list.filter(t => t.id !== id)); }
}
