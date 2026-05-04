import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CrmDashboardService } from '../services/crm-dashboard.service';
import { CrmLeadsService } from '../services/crm-leads.service';
import { AdminService } from '../../../core/services/admin.service';
import { ETAPE_LABELS, ETAPE_COLORS } from '../models/lead.model';

@Component({
  selector: 'app-crm-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './crm-dashboard.component.html',
  styleUrl: './crm-dashboard.component.css'
})
export class CrmDashboardComponent implements OnInit {

  totalLeads = 0;
  leadsPerdus = 0;

  // KPIs RDV
  rdvAujourdhui = 0;
  totalRdvMois = 0;

  // KPIs Finance
  facturesEnAttente = 0;
  facturesEnRetard = 0;
  montantEnAttente = 0;

  // KPIs CRM global
  totalClients = 0;
  contratsSignes = 0;
  contratsEnAttente = 0;

  // KPI consultant
  mesLeads = 0;
  isConsultant = false;
  isAdmin = false;

  // Graphique
  leadsParEtape: { label: string; value: number; color: string }[] = [];
  maxLeadsEtape = 1;

  // Activité récente
  activiteRecente: any[] = [];
  rdvList: any[] = [];

  loading = true;

  etapeLabels = ETAPE_LABELS;

  private dashboardService = inject(CrmDashboardService);
  private leadsService = inject(CrmLeadsService);
  private adminService = inject(AdminService);

  constructor() {}

  ngOnInit(): void {
    this.isConsultant = this.adminService.isConsultant();
    this.isAdmin = this.adminService.isAdmin();
    this.loadKpis();
    if (this.isConsultant) {
      this.loadMesLeads();
    }
  }

  loadKpis(): void {
    this.loading = true;
    this.dashboardService.getKpis().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const data = res.data;


          this.totalLeads = data.total_leads || 0;
          this.rdvAujourdhui = (data.rdv_aujourd_hui || []).length;
          this.totalRdvMois = data.total_rdv_mois || 0;
          this.rdvList = data.rdv_aujourd_hui || [];
          this.activiteRecente = data.activite_recente || [];

          this.facturesEnAttente = data.factures_en_attente || 0;
          this.facturesEnRetard = data.factures_en_retard || 0;
          this.montantEnAttente = data.montant_en_attente || 0;

          this.totalClients = data.total_clients || 0;
          this.contratsSignes = data.contrats_signes || 0;
          this.contratsEnAttente = data.contrats_en_attente || 0;
          this.leadsPerdus = data.leads_perdus || 0;

          const etapeData = data.leads_par_etape || {};
          this.leadsParEtape = Object.keys(etapeData).map(key => ({
            label: ETAPE_LABELS[key] || key,
            value: etapeData[key],
            color: ETAPE_COLORS[key] || '#94a3b8'
          }));
          this.maxLeadsEtape = Math.max(1, ...this.leadsParEtape.map(e => e.value));

        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadMesLeads(): void {
    this.leadsService.getLeads().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const username = localStorage.getItem('admin_username') || '';
          this.mesLeads = res.data.filter(
            (l: any) => l.consultantAssigne && l.consultantAssigne === username
          ).length;
        }
      },
      error: () => {}
    });
  }

  getBarWidth(value: number): string {
    return Math.round((value / this.maxLeadsEtape) * 100) + '%';
  }


}
