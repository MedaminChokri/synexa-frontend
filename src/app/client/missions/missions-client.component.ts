import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MissionService } from '../../core/services/mission.service';

@Component({
  selector: 'app-missions-client',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './missions-client.component.html',
  styleUrls: ['./missions-client.component.css']
})
export class MissionsClientComponent implements OnInit {
  missions: any[] = [];
  loading = false;
  clientId = 0;

  // Avis modal
  showAvisModal = false;
  missionAvis: any = null;
  avisCommentaire = '';
  avisNote = 0;
  avisSuccess = '';
  avisSaving = false;

  constructor(private missionService: MissionService) {}

  ngOnInit(): void {
    const stored = localStorage.getItem('clientUser');
    if (stored) {
      this.clientId = JSON.parse(stored).id;
      this.loadMissions();
    }
  }

  loadMissions(): void {
    this.loading = true;
    this.missionService.getMissionsClient(this.clientId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.missions = res.data.map((m: any) => {
            if (typeof m.phasesDetails === 'string') {
               try { m.phasesDetails = JSON.parse(m.phasesDetails); } catch(e) {}
            }
            return m;
          });
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getStatutClass(statut: string): string {
    if (!statut) return '';
    switch(statut) {
      case 'TERMINE': return 'phase-termine';
      case 'EN_COURS': return 'phase-encours';
      case 'A_VENIR': return 'phase-avenir';
      default: return '';
    }
  }

  getMissionStatut(statut: string): string {
    switch(statut) {
      case 'TERMINEE': return 'Mission Terminée';
      case 'EN_COURS': return 'En Cours';
      case 'SUSPENDUE': return 'Suspendue';
      default: return statut;
    }
  }

  openAvis(mission: any): void {
    this.missionAvis = mission;
    this.avisCommentaire = mission.commentaireClient || '';
    this.avisNote = mission.noteClient || 0;
    this.avisSuccess = '';
    this.showAvisModal = true;
  }

  closeAvis(): void {
    this.showAvisModal = false;
    this.missionAvis = null;
  }

  setNote(n: number): void {
    this.avisNote = n;
  }

  submitAvis(): void {
    if (!this.missionAvis || !this.avisCommentaire || !this.avisNote) return;
    this.avisSaving = true;
    this.missionService.ajouterAvis(this.missionAvis.id, this.avisCommentaire, this.avisNote).subscribe({
      next: (res: any) => {
        this.avisSaving = false;
        if (res.success) {
          this.avisSuccess = 'Votre avis a été enregistré !';
          this.loadMissions();
          setTimeout(() => this.closeAvis(), 1500);
        }
      },
      error: () => { this.avisSaving = false; }
    });
  }
}
