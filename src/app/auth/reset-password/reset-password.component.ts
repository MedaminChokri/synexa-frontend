import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClientService } from '../../core/services/client.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-shell">
      <div class="auth-grid">
        <section class="auth-right" style="margin:auto;max-width:520px;padding:48px 24px;">
          <div class="form-card">
            <h2>Réinitialiser le mot de passe</h2>
            <p class="form-sub" *ngIf="token">Choisissez un nouveau mot de passe pour votre compte.</p>

            <div class="alert-error" *ngIf="!token">
              Lien invalide. Demandez un nouveau lien sur la page « Mot de passe oublié ».
            </div>
            <div class="alert-success" *ngIf="success">
              <i class="fas fa-check-circle"></i> {{ success }}
            </div>
            <div class="alert-error" *ngIf="error">{{ error }}</div>

            <form *ngIf="token && !success" [formGroup]="form" (ngSubmit)="onSubmit()" autocomplete="off">
              <div class="field">
                <label for="rp-pwd">Nouveau mot de passe</label>
                <input id="rp-pwd" type="password" formControlName="motDePasse" placeholder="Au moins 6 caractères" autocomplete="new-password" />
                <span class="field-err" *ngIf="form.get('motDePasse')?.invalid && form.get('motDePasse')?.touched">
                  6 caractères minimum
                </span>
              </div>
              <div class="field">
                <label for="rp-pwd2">Confirmer le mot de passe</label>
                <input id="rp-pwd2" type="password" formControlName="confirmation" autocomplete="new-password" />
                <span class="field-err" *ngIf="form.errors?.['mismatch'] && form.get('confirmation')?.touched">
                  Les mots de passe ne correspondent pas
                </span>
              </div>
              <button type="submit" class="btn-submit" [disabled]="loading">
                <span *ngIf="!loading">Réinitialiser</span>
                <span *ngIf="loading">Réinitialisation…</span>
              </button>
            </form>

            <div class="form-footer">
              <a routerLink="/login">← Retour à la connexion</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styleUrls: ['../login/client-login.component.css']
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error = '';
  success = '';
  token = '';

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirmation: ['', Validators.required]
    }, { validators: (g) => g.get('motDePasse')?.value === g.get('confirmation')?.value ? null : { mismatch: true } });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    this.clientService.resetPassword(this.token, this.form.value.motDePasse).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.success = 'Mot de passe réinitialisé avec succès. Redirection vers la connexion…';
          setTimeout(() => this.router.navigate(['/login']), 1800);
        } else {
          this.error = res.message || 'Échec de la réinitialisation';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Lien invalide ou expiré';
      }
    });
  }
}
