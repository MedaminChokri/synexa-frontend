import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ClientService } from '../../core/services/client.service';
import { FactureService } from '../../core/services/facture.service';
import { environment } from '../../../environments/environment';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface Facture {
  id: number;
  numero: string;
  objet: string;
  montantHT: number;
  tva: number;
  montantTTC: number;
  statut: 'EN_ATTENTE' | 'PAYEE' | 'EN_RETARD' | 'ANNULEE';
  dateEmission: string;
  dateEcheance: string;
  fichierPdfUrl?: string;
}

@Component({
  selector: 'app-factures-client',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './factures-client.component.html',
  styleUrls: ['./factures-client.component.css']
})
export class FacturesClientComponent implements OnInit {

  factures: Facture[] = [];
  loading = true;
  clientId = 0;

  clientInfo: any = null;

  private clientService = inject(ClientService);
  private factureService = inject(FactureService);

  constructor() {}

  ngOnInit(): void {
    const stored = localStorage.getItem('clientUser');
    if (stored) {
      this.clientInfo = JSON.parse(stored);
      this.clientId = this.clientInfo.id;
    }
    this.loadFactures();
  }

  loadFactures(): void {
    this.loading = true;
    this.factureService.getFacturesClient(this.clientId).subscribe({
      next: (res) => {
        this.factures = res.data || res || [];
        this.loading = false;
      },
      error: () => {
        // Données de démo si le backend n'est pas encore prêt
        this.factures = [
          { id: 1, numero: 'FAC-2024-001', objet: 'Mission Audit SI – Phase 1', montantHT: 4500, tva: 19, montantTTC: 5355, statut: 'PAYEE', dateEmission: '2024-01-15', dateEcheance: '2024-02-14', fichierPdfUrl: '#' },
          { id: 2, numero: 'FAC-2024-002', objet: 'Conseil Stratégique Q1', montantHT: 2800, tva: 19, montantTTC: 3332, statut: 'EN_ATTENTE', dateEmission: '2024-03-01', dateEcheance: '2024-03-31' },
          { id: 3, numero: 'FAC-2024-003', objet: 'Formation Équipe Digitale', montantHT: 1200, tva: 19, montantTTC: 1428, statut: 'EN_RETARD', dateEmission: '2024-02-01', dateEcheance: '2024-03-01' },
        ];
        this.loading = false;
      }
    });
  }

  telechargerPdf(facture: Facture): void {
    if (facture.fichierPdfUrl && facture.fichierPdfUrl !== '#') {
      window.open(`${environment.apiUrl}/clients/${this.clientId}/factures/${facture.id}/pdf`, '_blank');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. En-tête Synexa
    doc.setTextColor(196, 149, 42); // #C4952A Gold
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text('SYNEXA', 20, 25);

    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Cabinet de Conseil & Solutions', 20, 32);
    doc.text('123 Avenue de l\'Innovation, Tunis', 20, 38);
    doc.text('Tél: +216 71 123 456', 20, 44);
    doc.text('Email: contact@synexa.com', 20, 50);

    // 2. Infos Client
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('FACTURE À :', 120, 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const nomClient = this.clientInfo ? `${this.clientInfo.prenom || ''} ${this.clientInfo.nom || ''}`.trim() : 'Client';
    doc.text(nomClient, 120, 32);
    let clientY = 38;
    if (this.clientInfo?.entreprise) {
      doc.text(this.clientInfo.entreprise, 120, clientY);
      clientY += 6;
    }
    if (this.clientInfo?.email) {
      doc.text(this.clientInfo.email, 120, clientY);
      clientY += 6;
    }
    if (this.clientInfo?.telephone) {
      doc.text('Tél: ' + this.clientInfo.telephone, 120, clientY);
    }

    // 3. Détails de la facture
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 60, pageWidth - 20, 60);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`FACTURE N° ${facture.numero}`, 20, 72);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date d'émission : ${new Date(facture.dateEmission).toLocaleDateString('fr-FR')}`, 20, 80);
    doc.text(`Date d'échéance : ${new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}`, 20, 86);
    
    const statutLabel = this.getStatutLabel(facture.statut);
    doc.text(`Statut : ${statutLabel}`, pageWidth - 60, 80);

    // 4. Tableau des articles
    autoTable(doc, {
      startY: 100,
      head: [['Description', 'Montant HT', 'TVA', 'Total TTC']],
      body: [
        [
          facture.objet,
          `${facture.montantHT.toFixed(2)} DT`,
          `${facture.tva}%`,
          `${facture.montantTTC.toFixed(2)} DT`
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [196, 149, 42], textColor: 255 },
      styles: { font: 'helvetica', fontSize: 10 },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'center' },
        3: { halign: 'right' }
      }
    });

    // 5. Total
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Total à payer : ${facture.montantTTC.toFixed(2)} DT`, pageWidth - 20, finalY, { align: 'right' });

    // 6. Pied de page
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Merci de votre confiance - Synexa Conseil', pageWidth / 2, pageHeight - 20, { align: 'center' });
    
    // Numéro de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Page ${i} / ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
    }

    doc.save(`facture_${facture.numero}.pdf`);
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

  getTotalTTC(): number {
    return this.factures.reduce((sum, f) => sum + f.montantTTC, 0);
  }

  getTotalPayees(): number {
    return this.factures.filter(f => f.statut === 'PAYEE').reduce((sum, f) => sum + f.montantTTC, 0);
  }

  getTotalEnAttente(): number {
    return this.factures.filter(f => f.statut === 'EN_ATTENTE' || f.statut === 'EN_RETARD').reduce((sum, f) => sum + f.montantTTC, 0);
  }
}
