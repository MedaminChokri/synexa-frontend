import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AnalyticsClientService } from '../../core/services/analytics-client.service';

/**
 * Page Profil Client — modifier profil + changer mot de passe (améliorations 2 + 3).
 */
@Component({
  selector: 'app-profil-client',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profil-client.component.html',
  styleUrls: ['./profil-client.component.css']
})
export class ProfilClientComponent implements OnInit {

  profilForm!: FormGroup;
  mdpForm!: FormGroup;
  clientId = 0;
  clientEmail = '';
  loading = false;
  profilSuccess = '';
  profilError = '';
  mdpSuccess = '';
  mdpError = '';
  mdpForce = 0; // 0-3 : rouge/orange/vert

  constructor(private fb: FormBuilder, private analyticsService: AnalyticsClientService) {}

  ngOnInit(): void {
    const stored = localStorage.getItem('clientUser');
    if (stored) {
      const client = JSON.parse(stored);
      this.clientId = client.id;
      this.clientEmail = client.email || '';
      this.profilForm = this.fb.group({
        nom: [client.nom || '', Validators.required],
        prenom: [client.prenom || '', Validators.required],
        telephone: [client.telephone || ''],
        entreprise: [client.entreprise || '']
      });
    }
    this.mdpForm = this.fb.group({
      ancienMdp: ['', Validators.required],
      nouveauMdp: ['', [Validators.required, Validators.minLength(8)]],
      confirmerMdp: ['', Validators.required]
    });

    this.mdpForm.get('nouveauMdp')?.valueChanges.subscribe(v => this.calculerForce(v));
  }

  calculerForce(mdp: string): void {
    let score = 0;
    if (mdp.length >= 8) score++;
    if (/[A-Z]/.test(mdp)) score++;
    if (/[0-9]/.test(mdp)) score++;
    if (/[^A-Za-z0-9]/.test(mdp)) score++;
    this.mdpForce = Math.min(3, score);
  }

  get forceLabel(): string { return ['Faible', 'Moyen', 'Fort', 'Très fort'][this.mdpForce] || ''; }
  get forceColor(): string { return ['#ef4444','#f97316','#10b981','#10b981'][this.mdpForce] || '#ef4444'; }

  hasMajuscule(): boolean {
    const val = this.mdpForm?.get('nouveauMdp')?.value || '';
    return /[A-Z]/.test(val);
  }

  hasChiffre(): boolean {
    const val = this.mdpForm?.get('nouveauMdp')?.value || '';
    return /[0-9]/.test(val);
  }

  sauvegarderProfil(): void {
    if (this.profilForm.invalid) return;
    this.loading = true;
    this.profilError = '';
    this.analyticsService.mettreAJourProfil(this.clientId, this.profilForm.value).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.profilSuccess = 'Profil mis à jour avec succès !';
          // Mettre à jour le localStorage
          const stored = localStorage.getItem('clientUser');
          if (stored) {
            const client = { ...JSON.parse(stored), ...this.profilForm.value };
            localStorage.setItem('clientUser', JSON.stringify(client));
          }
          setTimeout(() => this.profilSuccess = '', 3000);
        }
        this.loading = false;
      },
      error: (e: any) => {
        this.profilError = e.error?.message || 'Erreur lors de la mise à jour';
        this.loading = false;
      }
    });
  }

  changerMotDePasse(): void {
    if (this.mdpForm.invalid) return;
    const { ancienMdp, nouveauMdp, confirmerMdp } = this.mdpForm.value;
    if (nouveauMdp !== confirmerMdp) {
      this.mdpError = 'Les mots de passe ne correspondent pas';
      return;
    }
    this.mdpError = '';
    this.analyticsService.changerMotDePasse(this.clientId, ancienMdp, nouveauMdp).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.mdpSuccess = 'Mot de passe changé avec succès !';
          this.mdpForm.reset();
          setTimeout(() => this.mdpSuccess = '', 3000);
        } else {
          this.mdpError = res.message || 'Erreur';
        }
      },
      error: (e: any) => { this.mdpError = e.error?.message || 'Mot de passe actuel incorrect'; }
    });
  }
}
