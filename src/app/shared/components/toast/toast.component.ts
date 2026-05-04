import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      <div
        *ngFor="let toast of (toasts$ | async)"
        class="toast toast-{{ toast.type }}"
        (click)="toastService.remove(toast.id)">
        <i class="toast-icon fas"
           [class.fa-check-circle]="toast.type === 'success'"
           [class.fa-exclamation-circle]="toast.type === 'error'"
           [class.fa-info-circle]="toast.type === 'info'"></i>
        <span>{{ toast.message }}</span>
        <button class="toast-close" (click)="toastService.remove(toast.id)" aria-label="Fermer">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 380px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      animation: slideIn 0.3s ease;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      border-left: 4px solid;
    }
    .toast-success { background: #0f2d1a; color: #34d399; border-color: #34d399; }
    .toast-error   { background: #2d0f0f; color: #f87171; border-color: #f87171; }
    .toast-info    { background: #0f1f2d; color: #C4952A; border-color: #C4952A; }
    .toast-icon    { font-size: 1.1rem; flex-shrink: 0; }
    .toast span    { flex: 1; }
    .toast-close   { background: none; border: none; color: inherit; font-size: 1.2rem; cursor: pointer; padding: 0; opacity: 0.7; }
    .toast-close:hover { opacity: 1; }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(30px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class ToastComponent {
  toasts$: Observable<Toast[]>;
  constructor(public toastService: ToastService) {
    this.toasts$ = toastService.toasts;
  }
}
