import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-wrap">
      <div class="spinner"></div>
      <span class="text-muted text-sm" *ngIf="label">{{ label }}</span>
    </div>
  `
})
export class SpinnerComponent {
  @Input() label = '';
}
