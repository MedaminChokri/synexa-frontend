import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AnalyticsClientService } from '../../core/services/analytics-client.service';
import { ContratService } from '../../core/services/contrat.service';

/**
 * Page Mes Demandes — suivi en temps réel des contacts et RDV (amélioration 1 + 5 + 6).
 */
@Component({
  selector: 'app-mes-demandes',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './mes-demandes.component.html',
  styleUrls: ['./mes-demandes.component.css']
})
export class MesDemandesComponent implements OnInit {

  contacts: any[] = [];
  rendezvous: any[] = [];
  loading = false;
  clientId = 0;

  // Filtres
  filtreType = 'TOUS'; // TOUS, CONTACT, RDV
  filtreStatut = 'TOUS';

  // Notation modal
  showNotationModal = false;
  rdvANoter: any = null;
  notation = 3;
  commentaireNotation = '';
  notationSuccess = '';

  // PDF downloading
  pdfLoading: { [key: number]: boolean } = {};

  constructor(
    private analyticsService: AnalyticsClientService,
    private contratService: ContratService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const stored = localStorage.getItem('clientUser');
    if (stored) {
      try { this.clientId = JSON.parse(stored).id; } catch (e) { /* ignore */ }
    }
    this.chargerDemandes();
  }

  chargerDemandes(): void {
    if (!this.clientId) return;
    this.loading = true;
    this.analyticsService.getDemandes(this.clientId).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.contacts = res.data.contacts || [];
          this.rendezvous = res.data.rendezvous || [];
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get toutesLesDemandes(): any[] {
    let list: any[] = [];
    if (this.filtreType === 'TOUS' || this.filtreType === 'CONTACT') list = [...list, ...this.contacts];
    if (this.filtreType === 'TOUS' || this.filtreType === 'RDV') list = [...list, ...this.rendezvous];
    if (this.filtreStatut !== 'TOUS') {
      list = list.filter(d => d.statut === this.filtreStatut);
    }
    return list.sort((a, b) => {
      const da = a.date || a.dateCreation || '';
      const db = b.date || b.dateCreation || '';
      return db.toString().localeCompare(da.toString());
    });
  }

  getStatutColor(statut: string): string {
    switch (statut) {
      case 'CONFIRME': return '#10b981';
      case 'EN_COURS': return '#3b82f6';
      case 'EN_ATTENTE': return '#f97316';
      case 'ANNULE': return '#ef4444';
      default: return '#6b7280';
    }
  }

  getProgressionWidth(progression: number): string {
    return Math.max(0, Math.min(100, progression)) + '%';
  }

  // --- Task 3 & 4 additions ---
  envoyerMessage(demande: any): void {
    const sujetParam = demande.sujet || 'Demande';
    this.router.navigate(['/espace-client/messages'], { queryParams: { sujet: sujetParam } });
  }

  getServiceBadgeColor(service: string): string {
    if (!service) return '#6b7280'; // gris par defaut
    switch (service.toUpperCase()) {
      case 'CONSEIL': return '#3b82f6'; // bleu
      case 'TECH_IA': return '#8b5cf6'; // violet
      case 'EXPERTISE': return '#10b981'; // vert
      default: return '#6b7280'; // gris
    }
  }

  // Télécharger PDF confirmation (amélioration 5)
  downloadPdf(rdv: any): void {
    this.pdfLoading[rdv.id] = true;
    this.analyticsService.downloadConfirmationPdf(rdv.id).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `confirmation-rdv-${rdv.id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.pdfLoading[rdv.id] = false;
      },
      error: () => { this.pdfLoading[rdv.id] = false; }
    });
  }

  // Ouvrir modal notation (amélioration 6)
  ouvrirNotation(rdv: any): void {
    this.rdvANoter = rdv;
    this.notation = 3;
    this.commentaireNotation = '';
    this.notationSuccess = '';
    this.showNotationModal = true;
  }

  fermerNotation(): void {
    this.showNotationModal = false;
    this.rdvANoter = null;
  }

  soumettreNotation(): void {
    if (!this.rdvANoter) return;
    this.analyticsService.soumettreNotation(this.rdvANoter.id, this.notation, this.commentaireNotation).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.notationSuccess = 'Merci pour votre avis !';
          setTimeout(() => this.fermerNotation(), 2000);
        }
      },
      error: () => { this.notationSuccess = 'Erreur lors de l\'envoi de votre avis.'; }
    });
  }

  setEtoile(n: number): void { this.notation = n; }
  getEtoiles(): number[] { return [1, 2, 3, 4, 5]; }
}
