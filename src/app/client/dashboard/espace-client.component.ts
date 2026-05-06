import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClientService } from '../../core/services/client.service';
import { RendezVousService } from '../../core/services/rendez-vous.service';
import { MissionService } from '../../core/services/mission.service';
import { ContratService } from '../../core/services/contrat.service';
import { DocumentClientService } from '../../core/services/document-client.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MessageService } from '../../core/services/message.service';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-espace-client',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './espace-client.component.html',
  styleUrls: ['./espace-client.component.css']
})
export class EspaceClientComponent implements OnInit {
  clientName = '';
  clientEmail = '';
  clientId = 0;
  rendezvous: any[] = [];

  prochainRdv: any = null;
  missionActive: any = null;

  missionsProgression = 0;
  dernierContratStatut = 'Aucun contrat';
  documentsCount = 0;
  facturesMontantAttente = 0;
  messagesNonLus = 0;

  readonly servicesList = [
    'Conseil Stratégique',
    'Transformation Digitale',
    'Gestion de Projet',
    'Data Analytics',
    'Intelligence Artificielle',
    'Audit & Conformité',
    'Formation sur Mesure',
    'Autre'
  ];

  constructor(
    private clientService: ClientService,
    private rendezVousService: RendezVousService,
    private missionService: MissionService,
    private contratService: ContratService,
    private documentService: DocumentClientService,
    private messageService: MessageService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const stored = localStorage.getItem('clientUser');
    if (stored) {
      const client = JSON.parse(stored);
      this.clientName = client.prenom + ' ' + client.nom;
      this.clientEmail = client.email;
      this.clientId = client.id;
    } else {
      this.clientName = this.clientService.getClientName();
      this.clientEmail = localStorage.getItem('clientEmail') || '';
    }

    this.loadDynamicData();
    this.loadWidgetsData();
  }

  loadWidgetsData(): void {
    if (!this.clientId) return;

    this.missionService.getMissionsClient(this.clientId).subscribe((res: any) => {
      if (res.success && res.data && res.data.length > 0) {
        const activeMissions = res.data.filter((m: any) => m.statut === 'EN_COURS');
        this.missionsProgression = activeMissions.length > 0
          ? activeMissions[0].progression
          : res.data[0].progression;
      }
    });

    this.contratService.getContratsClient(this.clientId).subscribe((res: any) => {
      if (res.success && res.data && res.data.length > 0) {
        this.dernierContratStatut = res.data[0].statut;
      }
    });

    this.documentService.getDocuments(this.clientId).subscribe((res: any) => {
      if (res.success && res.data) {
        this.documentsCount = res.data.length;
      }
    });

    this.http.get<any>(`${environment.apiUrl}/clients/${this.clientId}/factures`).subscribe((res: any) => {
      if (res.success && res.data) {
        this.facturesMontantAttente = res.data
          .filter((f: any) => f.statut === 'EN_ATTENTE' || f.statut === 'EN_RETARD')
          .reduce((sum: number, f: any) => sum + f.montantTTC, 0);
      }
    });

    this.messageService.getConversationsClient(this.clientId).subscribe((res: any) => {
      if (res.success && Array.isArray(res.data)) {
        this.messagesNonLus = res.data.filter((c: any) => c.nonLus > 0).length;
      }
    });
  }

  loadDynamicData(): void {
    this.rendezVousService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const now = new Date();
          this.rendezvous = res.data.filter((r: any) =>
            r.email?.toLowerCase() === this.clientEmail?.toLowerCase()
          );
          const meRdvs = this.rendezvous.filter((r: any) =>
            r.statut !== 'ANNULE' && r.statut !== 'TERMINE'
          );
          const avecDateFuture = meRdvs
            .filter((r: any) => r.dateRendezVous && new Date(r.dateRendezVous) > now)
            .sort((a: any, b: any) => new Date(a.dateRendezVous).getTime() - new Date(b.dateRendezVous).getTime());
          if (avecDateFuture.length > 0) {
            this.prochainRdv = avecDateFuture[0];
          } else {
            const confirmes = meRdvs.filter((r: any) => r.statut === 'CONFIRME');
            this.prochainRdv = confirmes[0] || meRdvs[0] || null;
          }
        }
      },
      error: () => {}
    });

    if (this.clientId) {
      this.missionService.getMissionsClient(this.clientId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const active = res.data.find((m: any) => m.statut === 'EN_COURS');
            this.missionActive = active || res.data[0] || null;
          }
        },
        error: () => {}
      });
    }
  }

  getConfirmedCount(): number {
    return this.rendezvous.filter(r => r.confirme || r.statut === 'CONFIRME').length;
  }

  getPendingCount(): number {
    return this.rendezvous.filter(r => !r.confirme && r.statut !== 'CONFIRME' && r.statut !== 'ANNULE').length;
  }

  formatDateMonth(d: string): string {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }); }
    catch { return d; }
  }

  logout(): void {
    this.clientService.logout();
    this.router.navigate(['/login']);
  }
}
