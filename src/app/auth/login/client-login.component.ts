import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ClientService } from '../../core/services/client.service';
import { AdminService } from '../../core/services/admin.service';
import { LanguageService, AppLang } from '../../core/services/language.service';

@Component({
  selector: 'app-client-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './client-login.component.html',
  styleUrls: ['./client-login.component.css']
})
export class ClientLoginComponent {
  form: FormGroup;
  loading = false;
  error = '';
  success = '';
  showPassword = false;

  // Hexagones animés en arrière-plan
  hexList = Array.from({ length: 20 }, (_, i) => ({
    top:   `${Math.random() * 100}%`,
    left:  `${Math.random() * 100}%`,
    delay: `${(Math.random() * 4).toFixed(1)}s`
  }));

  // Particules flottantes
  particles = Array.from({ length: 15 }, () => {
    const size = `${3 + Math.random() * 5}px`;
    return {
      top:   `${90 + Math.random() * 10}%`,
      left:  `${Math.random() * 100}%`,
      dur:   `${8 + Math.random() * 12}s`,
      delay: `${(Math.random() * 8).toFixed(1)}s`,
      size,
    };
  });

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute,
    private languageService: LanguageService
  ) {
    this.form = this.fb.group({
      email:      ['', [Validators.required, Validators.email]],
      motDePasse: ['', Validators.required]
    });

    if (this.clientService.isLoggedIn()) {
      this.router.navigate(['/espace-client']);
    } else if (this.adminService.isLoggedIn()) {
      this.router.navigate(['/admin/dashboard']);
    }

    if (this.route.snapshot.queryParamMap.get('verified') === '1') {
      this.success = 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.';
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error   = '';
    const { email, motDePasse } = this.form.value;

    // Essai login client d'abord
    this.clientService.login(email, motDePasse).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.loading = false;
          this.router.navigate(['/espace-client']);
        } else if (res.message?.includes('vérifier')) {
          this.loading = false;
          this.error = 'Veuillez vérifier votre email avant de vous connecter.';
        } else {
          this.tryAdminLogin(email, motDePasse);
        }
      },
      error: (err: any) => {
        if (err.status === 403) {
          this.loading = false;
          this.error = 'Veuillez vérifier votre email avant de vous connecter.';
        } else {
          this.tryAdminLogin(email, motDePasse);
        }
      }
    });
  }

  private tryAdminLogin(email: string, motDePasse: string): void {
    this.adminService.login(email, motDePasse).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.success && res.data) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.error = 'Email ou mot de passe incorrect';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Email ou mot de passe incorrect';
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  get currentLang(): AppLang {
    return this.languageService.currentLang;
  }

  setLang(lang: AppLang): void {
    this.languageService.use(lang);
  }
}
