import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="cancel.emit()">
      <div class="modal modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-body" style="padding:28px 24px 20px">
          <div class="modal-icon-wrap danger">
            <span class="material-symbols-rounded">{{ icon() }}</span>
          </div>
          <p class="modal-confirm-title">{{ title() }}</p>
          <p class="modal-confirm-desc">{{ message() }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="cancel.emit()">Cancel</button>
          <button class="btn btn-danger" (click)="confirm.emit()">
            {{ confirmLabel() }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  title        = input<string>('Confirm Action');
  message      = input<string>('This action cannot be undone.');
  confirmLabel = input<string>('Delete');
  icon         = input<string>('delete_forever');
  confirm      = output<void>();
  cancel       = output<void>();
}
