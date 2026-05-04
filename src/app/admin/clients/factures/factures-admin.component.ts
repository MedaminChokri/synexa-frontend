import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { FactureService } from '../../../core/services/facture.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  entreprise?: string;
}

interface Facture {
  id: number;
  numero: string;
  objet: string;
  montantHT: number;
  tva: number;
  montantTTC: number;
  statut: 'EN_ATTENTE' | 'PAYEE' | 'EN_RETARD' | 'ANNULEE';
  dateEmission: string;
  dateEcheance: string;
  emiseParUtilisateur?: string;
  clientId: number;
  contratId?: number | null;
}

@Component({
  selector: 'app-factures-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './factures-admin.component.html',
  styleUrls: ['./factures-admin.component.css']
})
export class FacturesAdminComponent implements OnInit {

  clients: Client[] = [];
  factures: Facture[] = [];
  filteredFactures: Facture[] = [];
  contratsClient: any[] = [];

  loading = true;
  loadingFactures = false;

  selectedClientId: number | null = null;
  filterStatut = '';
  searchTerm = '';

  showCreateModal = false;
  savingFacture = false;
  successMessage = '';
  errorMessage = '';

  newFacture: {
    objet: string;
    montantHT: number;
    tva: number;
    dateEmission: string;
    dateEcheance: string;
    emiseParUtilisateur: string;
    contratId: number | null;
  } = {
    objet: '',
    montantHT: 0,
    tva: 19,
    dateEmission: '',
    dateEcheance: '',
    emiseParUtilisateur: 'Admin SYNEXA',
    contratId: null
  };

  showStatutModal = false;
  selectedFacture: Facture | null = null;
  newStatut: string = '';
  sendingEmailId: number | null = null;

  private http = inject(HttpClient);
  private factureService = inject(FactureService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/clients`).subscribe({
      next: (res) => {
        this.clients = (res.data || res || []).map((c: any) => ({
          id: c.id,
          nom: c.nom || '',
          prenom: c.prenom || '',
          email: c.email || '',
          entreprise: c.entreprise || ''
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }

  selectClient(clientId: number): void {
    this.selectedClientId = clientId;
    this.loadFacturesClient(clientId);
    this.loadContratsClient(clientId);
  }

  loadFacturesClient(clientId: number): void {
    this.loadingFactures = true;
    this.factures = [];
    this.filteredFactures = [];
    this.factureService.getFacturesClient(clientId).subscribe({
      next: (res: any) => {
        this.factures = res.data || res || [];
        this.applyFilters();
        this.loadingFactures = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingFactures = false; }
    });
  }

  loadContratsClient(clientId: number): void {
    this.http.get<any>(`${environment.apiUrl}/contrats/client/${clientId}`).subscribe({
      next: (res: any) => { this.contratsClient = res.data || []; },
      error: () => { this.contratsClient = []; }
    });
  }

  applyFilters(): void {
    let list = [...this.factures];
    if (this.filterStatut) {
      list = list.filter(f => f.statut === this.filterStatut);
    }
    if (this.searchTerm.trim()) {
      const t = this.searchTerm.toLowerCase();
      list = list.filter(f =>
        f.numero?.toLowerCase().includes(t) ||
        f.objet?.toLowerCase().includes(t)
      );
    }
    this.filteredFactures = list;
  }

  get selectedClient(): Client | null {
    return this.clients.find(c => c.id === this.selectedClientId) || null;
  }

  openCreateModal(): void {
    const today = new Date();
    const echeance = new Date(today);
    echeance.setDate(echeance.getDate() + 30);
    this.newFacture = {
      objet: '',
      montantHT: 0,
      tva: 19,
      dateEmission: today.toISOString().split('T')[0],
      dateEcheance: echeance.toISOString().split('T')[0],
      emiseParUtilisateur: 'Admin SYNEXA',
      contratId: null
    };
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  get montantTTCPreview(): number {
    const ht = this.newFacture.montantHT || 0;
    const tva = this.newFacture.tva || 0;
    return Math.round(ht * (1 + tva / 100) * 1000) / 1000;
  }

  creerFacture(): void {
    if (!this.selectedClientId || !this.newFacture.objet || !this.newFacture.montantHT) return;
    this.savingFacture = true;

    const now = new Date();
    const yyyy = now.getFullYear();
    const seq = String(Date.now()).slice(-4);
    const numero = `FAC-${yyyy}-${seq}`;

    const payload: any = {
      numero,
      clientId: this.selectedClientId,
      objet: this.newFacture.objet,
      montantHT: this.newFacture.montantHT,
      tva: this.newFacture.tva,
      montantTTC: this.montantTTCPreview,
      dateEmission: this.newFacture.dateEmission,
      dateEcheance: this.newFacture.dateEcheance,
      emiseParUtilisateur: this.newFacture.emiseParUtilisateur,
      statut: 'EN_ATTENTE'
    };
    if (this.newFacture.contratId) payload.contratId = this.newFacture.contratId;

    this.factureService.creerFacture(this.selectedClientId, payload).subscribe({
      next: (res: any) => {
        this.savingFacture = false;
        if (res.success) {
          this.factures.unshift(res.data);
          this.applyFilters();
          this.closeCreateModal();
          this.successMessage = 'Facture créée avec succès !';
          setTimeout(() => this.successMessage = '', 3000);
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.savingFacture = false;
        this.errorMessage = 'Erreur lors de la création.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  openStatutModal(facture: Facture): void {
    this.selectedFacture = facture;
    this.newStatut = facture.statut;
    this.showStatutModal = true;
  }

  closeStatutModal(): void {
    this.showStatutModal = false;
    this.selectedFacture = null;
  }

  changerStatut(): void {
    if (!this.selectedFacture || !this.selectedClientId) return;
    this.factureService.changerStatut(this.selectedClientId, this.selectedFacture.id, this.newStatut).subscribe({
      next: (res: any) => {
        if (res.success) {
          const idx = this.factures.findIndex(f => f.id === this.selectedFacture!.id);
          if (idx !== -1) this.factures[idx].statut = this.newStatut as any;
          this.applyFilters();
          this.closeStatutModal();
          this.successMessage = 'Statut mis à jour !';
          setTimeout(() => this.successMessage = '', 3000);
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la mise à jour.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      PAYEE: 'Payée', EN_ATTENTE: 'En attente', EN_RETARD: 'En retard', ANNULEE: 'Annulée'
    };
    return map[statut] || statut;
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      PAYEE: 'statut-payee', EN_ATTENTE: 'statut-attente', EN_RETARD: 'statut-retard', ANNULEE: 'statut-annulee'
    };
    return map[statut] || '';
  }

  getClientNom(c: Client): string {
    return `${c.prenom || ''} ${c.nom || ''}`.trim() || c.email;
  }

  telechargerPdf(facture: Facture): void {
    const client = this.selectedClient;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // En-tête SYNEXA
    doc.setFillColor(196, 149, 42);
    doc.rect(0, 0, pageWidth, 38, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('SYNEXA', 14, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Cabinet de Conseil & Solutions', 14, 25);
    doc.text('Tunis, Tunisie  |  contact@synexa-consult.com', 14, 31);

    // Titre facture en haut à droite
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('FACTURE', pageWidth - 14, 16, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`N° ${facture.numero}`, pageWidth - 14, 23, { align: 'right' });
    doc.text(`Émise le ${new Date(facture.dateEmission).toLocaleDateString('fr-FR')}`, pageWidth - 14, 30, { align: 'right' });

    // Section client
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURÉ À :', 14, 52);
    doc.setFont('helvetica', 'normal');
    let y = 59;
    if (client) {
      const nomClient = `${client.prenom || ''} ${client.nom || ''}`.trim();
      doc.setFont('helvetica', 'bold');
      doc.text(nomClient, 14, y); y += 6;
      doc.setFont('helvetica', 'normal');
      if (client.entreprise) { doc.text(client.entreprise, 14, y); y += 6; }
      doc.text(client.email, 14, y); y += 6;
    }

    // Infos facture à droite
    doc.setFont('helvetica', 'bold');
    doc.text('DÉTAILS FACTURE :', pageWidth / 2, 52);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date d'émission : ${new Date(facture.dateEmission).toLocaleDateString('fr-FR')}`, pageWidth / 2, 59);
    doc.text(`Date d'échéance : ${new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}`, pageWidth / 2, 65);
    const statutLabel = this.getStatutLabel(facture.statut);
    doc.text(`Statut : ${statutLabel}`, pageWidth / 2, 71);
    if (facture.emiseParUtilisateur) {
      doc.text(`Émis par : ${facture.emiseParUtilisateur}`, pageWidth / 2, 77);
    }

    // Ligne séparatrice
    doc.setDrawColor(196, 149, 42);
    doc.setLineWidth(0.5);
    doc.line(14, 88, pageWidth - 14, 88);

    // Tableau articles
    autoTable(doc, {
      startY: 94,
      head: [['Description', 'Montant HT', 'TVA', 'Total TTC']],
      body: [[
        facture.objet,
        `${Number(facture.montantHT).toFixed(3)} DT`,
        `${facture.tva}%`,
        `${Number(facture.montantTTC).toFixed(3)} DT`
      ]],
      theme: 'grid',
      headStyles: { fillColor: [196, 149, 42], textColor: 255, fontStyle: 'bold', fontSize: 10 },
      styles: { font: 'helvetica', fontSize: 10 },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'center' }, 3: { halign: 'right' } }
    });

    // Total
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFillColor(245, 245, 245);
    doc.rect(pageWidth / 2, finalY - 4, pageWidth / 2 - 14, 14, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`TOTAL TTC : ${Number(facture.montantTTC).toFixed(3)} DT`, pageWidth - 18, finalY + 6, { align: 'right' });

    // Pied de page
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFillColor(196, 149, 42);
    doc.rect(0, pageHeight - 18, pageWidth, 18, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('SYNEXA – Cabinet de Conseil | Tunis, Tunisie | contact@synexa-consult.com', pageWidth / 2, pageHeight - 9, { align: 'center' });
    doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} | Réf. ${facture.numero}`, pageWidth / 2, pageHeight - 4, { align: 'center' });

    doc.save(`facture_${facture.numero}.pdf`);
  }

  envoyerFactureEmail(facture: Facture): void {
    if (!this.selectedClientId || !facture.id) return;
    this.sendingEmailId = facture.id;
    this.factureService.envoyerParEmail(this.selectedClientId, facture.id).subscribe({
      next: (res: any) => {
        this.sendingEmailId = null;
        if (res.success) {
          this.successMessage = `Facture ${facture.numero} envoyée par email au client !`;
        } else {
          this.errorMessage = res.message || 'Erreur lors de l\'envoi';
        }
        setTimeout(() => { this.successMessage = ''; this.errorMessage = ''; }, 4000);
        this.cdr.detectChanges();
      },
      error: () => {
        this.sendingEmailId = null;
        this.errorMessage = 'Erreur réseau lors de l\'envoi de l\'email';
        setTimeout(() => this.errorMessage = '', 4000);
        this.cdr.detectChanges();
      }
    });
  }

  getTotalTTC(): number {
    return this.filteredFactures.reduce((s, f) => s + (f.montantTTC || 0), 0);
  }

  getTotalPayees(): number {
    return this.filteredFactures.filter(f => f.statut === 'PAYEE').reduce((s, f) => s + (f.montantTTC || 0), 0);
  }

  getTotalEnAttente(): number {
    return this.filteredFactures.filter(f => f.statut === 'EN_ATTENTE' || f.statut === 'EN_RETARD').reduce((s, f) => s + (f.montantTTC || 0), 0);
  }

  formatDate(d: string): string {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return d; }
  }
}
