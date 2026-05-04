import { Component, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="back-to-top"
      [class.visible]="visible"
      (click)="scrollToTop()"
      aria-label="Retour en haut"
      title="Retour en haut">
      <i class="fas fa-chevron-up"></i>
    </button>
  `,
  styles: [`
    .back-to-top {
      position: fixed;
      bottom: 32px;
      right: 32px;
      z-index: 900;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: #C4952A;
      color: #fff;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(196,149,42,0.4);
      opacity: 0;
      transform: translateY(20px);
      pointer-events: none;
      transition: all 0.3s ease;
    }
    .back-to-top.visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: all;
    }
    .back-to-top:hover {
      background: #A07820;
      transform: translateY(-3px);
    }
  `]
})
export class BackToTopComponent {
  visible = false;

  constructor(private cdr: ChangeDetectorRef) {}

  @HostListener('window:scroll')
  onScroll(): void {
    const was = this.visible;
    this.visible = window.scrollY > 300;
    if (was !== this.visible) this.cdr.markForCheck();
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
