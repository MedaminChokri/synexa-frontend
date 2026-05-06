import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../../core/services/client.service';
import { LanguageService, AppLang } from '../../core/services/language.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  get passwordStrength(): { score: number; label: string; color: string } {
    const pwd = this.signupForm.get('motDePasse')?.value || '';
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score, label: 'Faible', color: '#ef4444' };
    if (score <= 3) return { score, label: 'Moyen', color: '#f97316' };
    return { score, label: 'Fort', color: '#22c55e' };
  }

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private router: Router,
    private languageService: LanguageService
  ) {
    this.signupForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      entreprise: [''],
      telephone: [''],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirmMotDePasse: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const mdp = form.get('motDePasse')?.value;
    const confirm = form.get('confirmMotDePasse')?.value;
    return mdp === confirm ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.signupForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    const { confirmMotDePasse, ...clientData } = this.signupForm.value;
    this.clientService.signup(clientData).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.successMessage = 'Compte créé ! Vérifiez votre email pour activer votre compte.';
          const email = this.signupForm.get('email')?.value || '';
          setTimeout(() => this.router.navigate(['/verify-email'], { queryParams: { email } }), 1500);
        } else {
          this.errorMessage = res.message || 'Erreur lors de la création du compte';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la création du compte';
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  get currentLang(): AppLang {
    return this.languageService.currentLang;
  }

  setLang(lang: AppLang): void {
    this.languageService.use(lang);
  }
}
