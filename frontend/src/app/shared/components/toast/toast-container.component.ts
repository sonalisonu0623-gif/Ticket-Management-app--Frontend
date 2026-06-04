import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastSvc.toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }}">
          <div class="toast-icon">
            <span class="material-symbols-rounded">
              {{ toast.type === 'success' ? 'check_circle' :
                 toast.type === 'error'   ? 'cancel' :
                 toast.type === 'warning' ? 'warning' : 'info' }}
            </span>
          </div>
          <div class="toast-content">
            <div class="toast-title">{{ toast.title }}</div>
            @if (toast.message) { <div class="toast-message">{{ toast.message }}</div> }
          </div>
          <button class="toast-close" (click)="toastSvc.dismiss(toast.id)">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  readonly toastSvc = inject(ToastService);
}
