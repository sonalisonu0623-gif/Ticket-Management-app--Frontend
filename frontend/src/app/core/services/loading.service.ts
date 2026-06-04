import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _count = signal(0);
  readonly isLoading = computed(() => this._count() > 0);
  increment(): void { this._count.update(v => v + 1); }
  decrement(): void { this._count.update(v => Math.max(0, v - 1)); }
}
