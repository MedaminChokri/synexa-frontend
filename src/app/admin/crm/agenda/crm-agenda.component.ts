import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CrmRendezVousService } from '../services/crm-rendezvous.service';
import { CrmLeadsService } from '../services/crm-leads.service';
import { CrmRendezVous, RDV_STATUT_LABELS, RDV_STATUT_COLORS } from '../models/crm-rendezvous.model';
import { CrmLead } from '../models/lead.model';

/**
 * Composant Agenda CRM — liste des RDV groupés par date avec CRUD.
 */
@Component({
  selector: 'app-crm-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './crm-agenda.component.html',
  styleUrl: './crm-agenda.component.css'
})
export class CrmAgendaComponent implements OnInit {
  rdvList: CrmRendezVous[] = [];
  groupedRdv: { date: string; items: CrmRendezVous[] }[] = [];
  leads: CrmLead[] = [];
  loading = true;

  // Formulaire
  showModal = false;
  rdvForm!: FormGroup;
  submitting = false;
  editingId: number | null = null;

  // Filtre
  filtreStatut = '';

  // Labels
  statutLabels = RDV_STATUT_LABELS;
  statutColors = RDV_STATUT_COLORS;
  statuts = ['PLANIFIE', 'EFFECTUE', 'ANNULE'];
  types = ['PHYSIQUE', 'VISIO'];

  constructor(
    private rdvService: CrmRendezVousService,
    private leadsService: CrmLeadsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.rdvForm = this.fb.group({
      leadId: [null],
      titre: ['', Validators.required],
      dateHeure: ['', Validators.required],
      dureeMinutes: [30, [Validators.required, Validators.min(15)]],
      lieu: [''],
      type: ['VISIO'],
      statut: ['PLANIFIE'],
      notesPostRdv: ['']
    });
  }

  loadData(): void {
    this.loading = true;
    // Charger les leads pour le select
    this.leadsService.getLeads().subscribe({
      next: (res) => {
        this.leads = res.success ? (res.data || []) : [];
      }
    });
    // Charger les RDV
    this.loadRdv();
  }

  loadRdv(): void {
    this.loading = true;
    const statut = this.filtreStatut || undefined;
    this.rdvService.getAll(statut).subscribe({
      next: (res) => {
        this.rdvList = res.success ? (res.data || []) : [];
        this.groupByDate();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  /** Grouper les RDV par date */
  groupByDate(): void {
    const groups: Record<string, CrmRendezVous[]> = {};
    for (const rdv of this.rdvList) {
      const date = rdv.dateHeure ? rdv.dateHeure.substring(0, 10) : 'Aucune date';
      if (!groups[date]) groups[date] = [];
      groups[date].push(rdv);
    }
    this.groupedRdv = Object.keys(groups)
      .sort()
      .map(date => ({ date, items: groups[date] }));
  }

  onFilterChange(): void {
    this.loadRdv();
  }

  openCreateModal(): void {
    this.editingId = null;
    this.rdvForm.reset({
      dureeMinutes: 30,
      type: 'VISIO',
      statut: 'PLANIFIE'
    });
    this.showModal = true;
  }

  openEditModal(rdv: CrmRendezVous): void {
    this.editingId = rdv.id!;
    this.rdvForm.patchValue({
      ...rdv,
      dateHeure: rdv.dateHeure ? rdv.dateHeure.substring(0, 16) : ''
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingId = null;
  }

  submitRdv(): void {
    if (this.rdvForm.invalid) return;
    this.submitting = true;

    const rdvData = this.rdvForm.value;

    if (this.editingId) {
      this.rdvService.update(this.editingId, rdvData).subscribe({
        next: () => {
          this.submitting = false;
          this.closeModal();
          this.loadRdv();
        },
        error: () => { this.submitting = false; }
      });
    } else {
      this.rdvService.create(rdvData).subscribe({
        next: () => {
          this.submitting = false;
          this.closeModal();
          this.loadRdv();
        },
        error: () => { this.submitting = false; }
      });
    }
  }

  changeStatut(rdv: CrmRendezVous, statut: string): void {
    if (rdv.id) {
      this.rdvService.updateStatut(rdv.id, statut).subscribe({
        next: () => this.loadRdv()
      });
    }
  }

  deleteRdv(id: number): void {
    if (!confirm('Supprimer ce rendez-vous ?')) return;
    this.rdvService.delete(id).subscribe(() => this.loadRdv());
  }

  /** Trouver le nom du lead associé */
  getLeadName(leadId?: number): string {
    if (!leadId) return '—';
    const lead = this.leads.find(l => l.id === leadId);
    return lead ? `${lead.prenom || ''} ${lead.nom}`.trim() : '—';
  }

  /** Vérifier si une date est aujourd'hui */
  isToday(dateStr: string): boolean {
    const today = new Date().toISOString().substring(0, 10);
    return dateStr === today;
  }

  /** Vérifier si une date est dans le passé */
  isPast(dateStr: string): boolean {
    const today = new Date().toISOString().substring(0, 10);
    return dateStr < today;
  }
}
