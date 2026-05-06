import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClientService } from '../../core/services/client.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['../login/client-login.component.css']
})
export class ForgotPasswordComponent {
  form: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(private fb: FormBuilder, private clientService: ClientService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    this.clientService.forgotPassword(this.form.value.email).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = res.message || 'Si un compte existe avec cet email, un lien vient de vous être envoyé.';
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Une erreur est survenue. Réessayez plus tard.';
      }
    });
  }
}
