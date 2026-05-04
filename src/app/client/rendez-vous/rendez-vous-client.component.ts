import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RendezVousService } from '../../core/services/rendez-vous.service';

@Component({
  selector: 'app-rendez-vous-client',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './rendez-vous-client.component.html',
  styleUrls: ['./rendez-vous-client.component.css']
})
export class RendezVousClientComponent implements OnInit {
  mesRendezVous: any[] = [];
  mesCrmRdv: any[] = [];
  loading = true;
  showForm = false;
  submitting = false;
  successMsg = '';
  errorMsg = '';

  rdvForm: FormGroup;
  clientEmail = '';
  clientNom = '';
  clientTel = '';
  clientEntreprise = '';

  services = [
    'Conseil & Stratégie',
    'Tech & IA',
    'Expertise Métier',
    'Audit & Diagnostic',
    'Autre'
  ];

  constructor(
    private rdvService: RendezVousService,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.rdvForm = this.fb.group({
      serviceChoisi: ['', Validators.required],
      dateRendezVous: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const stored = localStorage.getItem('clientUser');
    if (stored) {
      const client = JSON.parse(stored);
      this.clientEmail = client.email || '';
      this.clientNom = (client.prenom || '') + ' ' + (client.nom || '');
      this.clientTel = client.telephone || '';
      this.clientEntreprise = client.entreprise || '';
    }
    this.loadRendezVous();
    this.loadCrmRdv();
  }

  loadRendezVous(): void {
    this.loading = true;
    this.rdvService.getAll().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.mesRendezVous = res.data.filter((r: any) =>
            r.email?.toLowerCase() === this.clientEmail.toLowerCase()
          );
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadCrmRdv(): void {
    if (!this.clientEmail) return;
    this.http.get<any>(`http://localhost:8080/api/crm/rendezvous/by-email?email=${encodeURIComponent(this.clientEmail)}`).subscribe({
      next: (res: any) => {
        if (res.success && res.data) this.mesCrmRdv = res.data;
      },
      error: () => { this.mesCrmRdv = []; }
    });
  }

  getCrmStatutLabel(statut: string): string {
    const map: any = { PLANIFIE: 'Planifié', EFFECTUE: 'Effectué', ANNULE: 'Annulé' };
    return map[statut] || statut;
  }

  getCrmStatutClass(statut: string): string {
    const map: any = { PLANIFIE: 'statut-confirme', EFFECTUE: 'statut-termine', ANNULE: 'statut-annule' };
    return map[statut] || 'statut-attente';
  }

  submitRdv(): void {
    if (this.rdvForm.invalid) return;
    this.submitting = true;
    this.successMsg = '';
    this.errorMsg = '';

    const payload = {
      nom: this.clientNom.trim(),
      email: this.clientEmail,
      telephone: this.clientTel || '',
      entreprise: this.clientEntreprise || '',
      ...this.rdvForm.value
    };

    this.rdvService.createRendezVous(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        if (res.success) {
          this.successMsg = 'Votre demande de rendez-vous a été envoyée avec succès !';
          this.rdvForm.reset();
          this.showForm = false;
          this.loadRendezVous();
        } else {
          this.errorMsg = res.message || 'Erreur lors de l\'envoi.';
        }
      },
      error: () => {
        this.submitting = false;
        this.errorMsg = 'Erreur lors de l\'envoi de la demande.';
      }
    });
  }

  getStatutClass(statut: string): string {
    const map: any = {
      EN_ATTENTE: 'statut-attente',
      CONFIRME: 'statut-confirme',
      ANNULE: 'statut-annule',
      TERMINE: 'statut-termine'
    };
    return map[statut] || 'statut-attente';
  }

  getStatutLabel(statut: string): string {
    const map: any = {
      EN_ATTENTE: 'En attente',
      CONFIRME: 'Confirmé',
      ANNULE: 'Annulé',
      TERMINE: 'Terminé'
    };
    return map[statut] || statut;
  }
}
