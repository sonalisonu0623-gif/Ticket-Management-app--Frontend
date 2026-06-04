import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-shell">
      <div class="auth-bg">
        <div class="auth-grid-lines"></div>
        <div class="auth-glow g1"></div>
        <div class="auth-glow g2"></div>
      </div>
      <div class="auth-content">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [`
    .auth-shell { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0b0f1a; overflow: auto; position: relative; }
    .auth-bg { position: fixed; inset: 0; pointer-events: none; }
    .auth-grid-lines {
      position: absolute; inset: 0;
      background-image: linear-gradient(rgba(59,130,246,.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59,130,246,.04) 1px, transparent 1px);
      background-size: 44px 44px;
    }
    .auth-glow {
      position: absolute; border-radius: 50%;
      filter: blur(100px); pointer-events: none; opacity: .6;
    }
    .g1 { width: 600px; height: 600px; background: rgba(59,130,246,.09); top: -200px; left: -150px; }
    .g2 { width: 500px; height: 500px; background: rgba(139,92,246,.07); bottom: -200px; right: -100px; }
    .auth-content { position: relative; z-index: 1; width: 100%; display: flex; justify-content: center; padding: 24px; }
  `]
})
export class AuthLayoutComponent {}
