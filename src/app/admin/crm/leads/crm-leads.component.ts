import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CrmLeadsService } from '../services/crm-leads.service';
import { CrmLead, ETAPE_LABELS, SOURCE_LABELS, SECTEUR_LABELS, ETAPE_COLORS } from '../models/lead.model';

@Component({
  selector: 'app-crm-leads',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crm-leads.component.html',
  styleUrl: './crm-leads.component.css'
})
export class CrmLeadsComponent implements OnInit {
  leads: CrmLead[] = [];
  loading = true;

  filtreEtape = '';
  filtreSource = '';

  etapeLabels = ETAPE_LABELS;
  sourceLabels = SOURCE_LABELS;
  secteurLabels = SECTEUR_LABELS;
  etapeColors = ETAPE_COLORS;

  etapes = ['NOUVEAU', 'CONTACTE', 'QUALIFIE', 'PROPOSITION', 'SIGNE', 'PERDU'];
  sources = ['SITE', 'CHATBOT', 'MANUEL'];

  constructor(
    private leadsService: CrmLeadsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLeads();
  }

  loadLeads(): void {
    this.loading = true;
    const etape = this.filtreEtape || undefined;
    const source = this.filtreSource || undefined;
    this.leadsService.getLeads(etape, source).subscribe({
      next: (res) => {
        this.leads = res.success ? (res.data || []) : [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onFilterChange(): void {
    this.loadLeads();
  }

  goToDetail(id: number): void {
    this.router.navigate(['/admin/dashboard/crm/leads', id]);
  }

  deleteLead(id: number, event: Event): void {
    event.stopPropagation();
    if (!confirm('Supprimer ce lead ?')) return;
    this.leadsService.deleteLead(id).subscribe(() => this.loadLeads());
  }

  getStars(score: number): number[] {
    const s = Math.max(0, Math.min(5, Math.round(score || 0)));
    return Array(s).fill(0);
  }

  getEmptyStars(score: number): number[] {
    const s = Math.max(0, Math.min(5, Math.round(score || 0)));
    return Array(5 - s).fill(0);
  }
}
