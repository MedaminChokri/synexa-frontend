import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsClientService } from '../../core/services/analytics-client.service';
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-historique-client',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './historique-client.component.html',
  styleUrls: ['./historique-client.component.css']
})
export class HistoriqueClientComponent implements OnInit {
  historique: any[] = [];
  filteredHistorique: any[] = [];
  loading = false;
  clientId = 0;
  
  filtreType = 'TOUS';
  filtrePeriode = 'TOUT';

  constructor(private analyticsService: AnalyticsClientService, private datePipe: DatePipe) {}

  ngOnInit(): void {
    const stored = localStorage.getItem('clientUser');
    if (stored) {
      this.clientId = JSON.parse(stored).id;
      this.loadHistorique();
    }
  }

  loadHistorique(): void {
    this.loading = true;
    this.analyticsService.getHistorique(this.clientId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.historique = res.data;
          this.applyFilters();
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilters(): void {
    let filtered = [...this.historique];
    
    // Type
    if (this.filtreType !== 'TOUS') {
      filtered = filtered.filter(item => item.type === this.filtreType);
    }
    
    // Période
    if (this.filtrePeriode !== 'TOUT') {
      const now = new Date();
      let limitDate = new Date();
      if (this.filtrePeriode === '7J') limitDate.setDate(now.getDate() - 7);
      else if (this.filtrePeriode === '30J') limitDate.setDate(now.getDate() - 30);
      else if (this.filtrePeriode === '3M') limitDate.setMonth(now.getMonth() - 3);
      
      filtered = filtered.filter(item => new Date(item.date) >= limitDate);
    }
    
    this.filteredHistorique = filtered;
  }

  setFiltreType(type: string): void {
    this.filtreType = type;
    this.applyFilters();
  }

  setFiltrePeriode(periode: string): void {
    this.filtrePeriode = periode;
    this.applyFilters();
  }

  exportPdf(): void {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Historique Client', 20, 20);
    
    const tableData = this.filteredHistorique.map(item => [
      this.datePipe.transform(item.date, 'dd/MM/yyyy HH:mm'),
      item.type,
      item.titre,
      item.statut
    ]);
    
    autoTable(doc, {
      startY: 30,
      head: [['Date', 'Type', 'Description', 'Statut']],
      body: tableData,
    });
    
    doc.save(`historique_${this.clientId}.pdf`);
  }
}
