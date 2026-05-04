import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MissionService } from '../../../core/services/mission.service';
import { environment } from '../../../../environments/environment';

interface PhaseDetail {
  numero: number;
  titre: string;
  statut: 'A_VENIR' | 'EN_COURS' | 'TERMINE';
}

@Component({
  selector: 'app-missions-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './missions-admin.component.html',
  styleUrls: ['./missions-admin.component.css']
})
export class MissionsAdminComponent implements OnInit {

  missions: any[] = [];
  clients: any[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';

  // Modal phase update
  showPhaseModal = false;
  missionSelected: any = null;
  phaseSelected: any = null;
  nouveauStatutPhase = '';

  // Modal create mission
  showCreateModal = false;
  saving = false;

  newMission = {
    clientId: null as number | null,
    titre: '',
    description: '',
    service: '',
    phasesTotales: 4,
    dateDebut: '',
    dateFinPrevue: '',
    statut: 'EN_COURS'
  };

  phases: PhaseDetail[] = [];

  defaultPhasesTitles = [
    'Diagnostic & Analyse',
    'Conception & Planification',
    'Réalisation & Déploiement',
    'Validation & Clôture'
  ];

  constructor(
    private missionService: MissionService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMissions();
    this.loadClients();
    const today = new Date();
    this.newMission.dateDebut = today.toISOString().split('T')[0];
    const fin = new Date(today);
    fin.setMonth(fin.getMonth() + 3);
    this.newMission.dateFinPrevue = fin.toISOString().split('T')[0];
  }

  loadMissions(): void {
    this.loading = true;
    this.missionService.getAllMissions().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.missions = res.data.map((m: any) => {
            if (typeof m.phasesDetails === 'string') {
              try { m.phasesDetails = JSON.parse(m.phasesDetails); } catch (e) {}
            }
            return m;
          });
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }

  loadClients(): void {
    this.http.get<any>(`${environment.apiUrl}/clients`).subscribe({
      next: (res) => {
        this.clients = res.data || res || [];
      }
    });
  }

  // ── Create mission modal ──

  openCreateModal(): void {
    const today = new Date();
    this.newMission = {
      clientId: null,
      titre: '',
      description: '',
      service: '',
      phasesTotales: 4,
      dateDebut: today.toISOString().split('T')[0],
      dateFinPrevue: (() => { const d = new Date(today); d.setMonth(d.getMonth() + 3); return d.toISOString().split('T')[0]; })(),
      statut: 'EN_COURS'
    };
    this.rebuildPhases(4);
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  rebuildPhases(n: number): void {
    const current = this.phases;
    this.phases = Array.from({ length: n }, (_, i) => ({
      numero: i + 1,
      titre: current[i]?.titre || this.defaultPhasesTitles[i] || `Phase ${i + 1}`,
      statut: (current[i]?.statut || 'A_VENIR') as 'A_VENIR' | 'EN_COURS' | 'TERMINE'
    }));
  }

  onPhasesCountChange(): void {
    this.rebuildPhases(this.newMission.phasesTotales);
  }

  creerMission(): void {
    if (!this.newMission.clientId || !this.newMission.titre) return;
    this.saving = true;

    const payload: any = {
      titre: this.newMission.titre,
      description: this.newMission.description,
      service: this.newMission.service,
      phasesTotales: this.newMission.phasesTotales,
      phaseActuelle: 1,
      phasesDetails: JSON.stringify(this.phases),
      statut: this.newMission.statut,
      dateDebut: this.newMission.dateDebut || null,
      dateFinPrevue: this.newMission.dateFinPrevue || null,
      progression: 0
    };

    this.missionService.creerMission(this.newMission.clientId, payload).subscribe({
      next: (res: any) => {
        this.saving = false;
        if (res.success) {
          this.closeCreateModal();
          this.loadMissions();
          this.successMessage = 'Mission créée avec succès !';
          setTimeout(() => this.successMessage = '', 3000);
        } else {
          this.errorMessage = res.message || 'Erreur lors de la création.';
          setTimeout(() => this.errorMessage = '', 3000);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.saving = false;
        this.errorMessage = 'Erreur lors de la création de la mission.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  // ── Phase update modal ──

  openPhaseModal(mission: any, phase: any): void {
    this.missionSelected = mission;
    this.phaseSelected = phase;
    this.nouveauStatutPhase = phase.statut;
    this.showPhaseModal = true;
  }

  closePhaseModal(): void {
    this.showPhaseModal = false;
    this.missionSelected = null;
    this.phaseSelected = null;
  }

  updatePhaseStatut(): void {
    if (!this.missionSelected || !this.phaseSelected) return;
    this.missionService.mettreAJourPhase(
      this.missionSelected.id,
      { numeroPhase: this.phaseSelected.numero, statut: this.nouveauStatutPhase }
    ).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.closePhaseModal();
          this.loadMissions();
          this.successMessage = 'Phase mise à jour !';
          setTimeout(() => this.successMessage = '', 3000);
        }
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la mise à jour.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  // ── Helpers ──

  getPhaseStatutClass(statut: string): string {
    const map: Record<string, string> = {
      TERMINE: 'badge-success',
      EN_COURS: 'badge-primary',
      A_VENIR: 'badge-neutral'
    };
    return map[statut] || '';
  }

  getMissionStatutClass(statut: string): string {
    const map: Record<string, string> = {
      TERMINEE: 'badge-success',
      EN_COURS: 'badge-primary',
      SUSPENDUE: 'badge-warning'
    };
    return map[statut] || '';
  }

  getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      EN_COURS: 'En cours', TERMINEE: 'Terminée', SUSPENDUE: 'Suspendue'
    };
    return map[statut] || statut;
  }

  getPhaseLabel(statut: string): string {
    const map: Record<string, string> = {
      A_VENIR: 'À venir', EN_COURS: 'En cours', TERMINE: 'Terminée'
    };
    return map[statut] || statut;
  }

  getClientNom(client: any): string {
    if (!client) return 'Client inconnu';
    return `${client.prenom || ''} ${client.nom || ''}`.trim() || client.email;
  }

  formatDate(d: string): string {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return d; }
  }
}
