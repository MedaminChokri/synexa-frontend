import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit, OnDestroy {

  email = '';
  code = '';
  loading = false;
  resending = false;
  successMessage = '';
  errorMessage = '';

  // Countdown pour renvoyer le code (60s)
  resendCooldown = 0;
  private cooldownInterval: any;

  // Countdown expiration (15 min)
  expirationSeconds = 15 * 60;
  private expirationInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    if (!this.email) {
      this.router.navigate(['/signup']);
      return;
    }
    this.startExpirationCountdown();
    this.startResendCooldown();
  }

  ngOnDestroy(): void {
    clearInterval(this.cooldownInterval);
    clearInterval(this.expirationInterval);
  }

  private startExpirationCountdown(): void {
    this.expirationSeconds = 15 * 60;
    this.expirationInterval = setInterval(() => {
      if (this.expirationSeconds > 0) {
        this.expirationSeconds--;
      } else {
        clearInterval(this.expirationInterval);
      }
    }, 1000);
  }

  private startResendCooldown(): void {
    this.resendCooldown = 60;
    this.cooldownInterval = setInterval(() => {
      if (this.resendCooldown > 0) {
        this.resendCooldown--;
      } else {
        clearInterval(this.cooldownInterval);
      }
    }, 1000);
  }

  get expirationLabel(): string {
    const m = Math.floor(this.expirationSeconds / 60);
    const s = this.expirationSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  verifier(): void {
    if (!this.code.trim() || this.code.length !== 6) {
      this.errorMessage = 'Veuillez entrer un code à 6 chiffres.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.http.post<any>(`${environment.apiUrl}/clients/verify-email`, {
      email: this.email,
      code: this.code.trim()
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.successMessage = 'Email vérifié ! Votre compte est activé.';
          setTimeout(() => this.router.navigate(['/login'], { queryParams: { verified: '1' } }), 2000);
        } else {
          this.errorMessage = res.message || 'Code incorrect.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la vérification.';
      }
    });
  }

  renvoyerCode(): void {
    if (this.resendCooldown > 0 || this.resending) return;
    this.resending = true;
    this.errorMessage = '';
    this.http.post<any>(`${environment.apiUrl}/clients/resend-verification`, { email: this.email }).subscribe({
      next: (res) => {
        this.resending = false;
        if (res.success) {
          this.successMessage = 'Nouveau code envoyé !';
          setTimeout(() => this.successMessage = '', 4000);
          clearInterval(this.expirationInterval);
          this.startExpirationCountdown();
          this.startResendCooldown();
        } else {
          this.errorMessage = res.message || 'Erreur lors du renvoi.';
        }
      },
      error: () => {
        this.resending = false;
        this.errorMessage = 'Erreur réseau lors du renvoi.';
      }
    });
  }
}
