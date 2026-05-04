import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsClientService } from '../../core/services/analytics-client.service';
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-analytics-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics-client.component.html',
  styleUrls: ['./analytics-client.component.css']
})
export class AnalyticsClientComponent implements OnInit {
  clientId = 0;
  clientEmail = '';
  loading = false;
  analytics: any = null;
  Math = Math;

  constructor(private analyticsService: AnalyticsClientService) {}

  ngOnInit(): void {
    const stored = localStorage.getItem('clientUser');
    if (stored) {
      const client = JSON.parse(stored);
      this.clientId = client.id;
      this.clientEmail = client.email || '';
      this.chargerAnalytics();
    }
  }

  chargerAnalytics(): void {
    this.loading = true;
    this.analyticsService.getAnalytics(this.clientId).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.analytics = res.data;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  exporterRapport(): void {
    if (!this.analytics) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Rapport Analytique - SYNEXA", 20, 20);
    doc.setFontSize(14);
    doc.text(`Client ID: ${this.clientId}`, 20, 30);
    
    autoTable(doc, {
      startY: 40,
      head: [['Métrique', 'Valeur']],
      body: [
        ['Total Demandes', this.analytics.total_demandes],
        ['Total RDV', this.analytics.total_rdv],
        ['Taux de Confirmation RDV', this.analytics.taux_confirmation + '%'],
        ['Total Missions', this.analytics.total_missions],
        ['Missions Terminées', this.analytics.missions_terminees],
        ['Total Contrats Signés', this.analytics.total_contrats_signes],
        ['Total Documents', this.analytics.total_documents],
        ['Niveau de Fidélité', this.analytics.niveau_fidelite]
      ]
    });
    
    doc.save(`Rapport_Analytique_${this.clientId}.pdf`);
  }
}
