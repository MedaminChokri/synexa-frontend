import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CrmLeadsService } from '../services/crm-leads.service';
import { CrmNotesService } from '../services/crm-notes.service';
import { CrmLead, ETAPE_LABELS, SOURCE_LABELS, SECTEUR_LABELS, ETAPE_COLORS } from '../models/lead.model';
import { CrmNote } from '../models/note.model';

/**
 * Composant détail d'un lead CRM — infos complètes, timeline de notes, changement d'étape.
 */
@Component({
  selector: 'app-crm-lead-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './crm-lead-detail.component.html',
  styleUrl: './crm-lead-detail.component.css'
})
export class CrmLeadDetailComponent implements OnInit {
  lead: CrmLead | null = null;
  notes: CrmNote[] = [];
  loading = true;
  leadId!: number;

  // Timeline
  timeline: any[] = [];
  showTimeline = true;
  parsedTags: string[] = [];
  scoreProbabilite = 50;

  // Formulaire note
  showNoteForm = false;
  noteForm!: FormGroup;
  submittingNote = false;

  // Formulaire modification lead
  showEditForm = false;
  editForm!: FormGroup;
  submittingEdit = false;

  // Labels
  etapeLabels = ETAPE_LABELS;
  sourceLabels = SOURCE_LABELS;
  secteurLabels = SECTEUR_LABELS;
  etapeColors = ETAPE_COLORS;

  etapes = ['NOUVEAU', 'CONTACTE', 'QUALIFIE', 'PROPOSITION', 'SIGNE', 'PERDU'];
  sources = ['SITE', 'CHATBOT', 'MANUEL'];
  secteurs = ['AGROALIMENTAIRE', 'FINANCE', 'INDUSTRIE', 'CONSEIL', 'AUTRE'];
  noteTypes = ['APPEL', 'EMAIL', 'RDV', 'NOTE'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leadsService: CrmLeadsService,
    private notesService: CrmNotesService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.leadId = +this.route.snapshot.paramMap.get('id')!;
    this.initForms();
    this.loadLead();
    this.loadNotes();
    this.loadTimeline();
  }

  initForms(): void {
    this.noteForm = this.fb.group({
      auteur: ['', Validators.required],
      contenu: ['', Validators.required],
      type: ['NOTE']
    });

    this.editForm = this.fb.group({
      prenom: [''],
      nom: ['', Validators.required],
      email: ['', Validators.email],
      telephone: [''],
      entreprise: [''],
      secteur: ['AUTRE'],
      pays: [''],
      serviceSouhaite: [''],
      source: ['MANUEL'],
      etape: ['NOUVEAU'],
      consultantAssigne: [''],
      score: [3, [Validators.min(1), Validators.max(5)]],
      motifPerte: ['']
    });
  }

  loadLead(): void {
    this.loading = true;
    this.leadsService.getLeadById(this.leadId).subscribe({
      next: (res) => {
        if (res.success) {
          this.lead = res.data;
          this.editForm.patchValue(this.lead);
          this.parsedTags = this.parseLeadTags();
          this.scoreProbabilite = this.lead?.scoreProbabilite || 50;
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadTimeline(): void {
    this.leadsService.getTimeline(this.leadId).subscribe({
      next: (res) => {
        this.timeline = res.success ? (res.data || []) : [];
      },
      error: () => {}
    });
  }

  parseLeadTags(): string[] {
    if (!this.lead?.tags) return [];
    try { return JSON.parse(this.lead.tags); } catch { return []; }
  }

  getTagColor(index: number): string {
    const colors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#f97316'];
    return colors[index % colors.length];
  }

  getTimelineIconBg(type: string): string {
    if (type?.includes('APPEL')) return '#8b5cf6';
    if (type?.includes('EMAIL')) return '#3b82f6';
    if (type?.includes('RDV') || type?.includes('rdv')) return '#10b981';
    if (type === 'CREATION') return '#10b981';
    if (type === 'RELANCE') return '#f59e0b';
    return '#6b7280';
  }

  loadNotes(): void {
    this.notesService.getNotes(this.leadId).subscribe({
      next: (res) => {
        this.notes = res.success ? (res.data || []) : [];
      }
    });
  }

  /** Changer l'étape du lead */
  changeEtape(etape: string): void {
    this.leadsService.updateEtape(this.leadId, etape).subscribe({
      next: (res) => {
        if (res.success && this.lead) {
          this.lead.etape = etape as any;
        }
      }
    });
  }

  /** Ajouter une note */
  submitNote(): void {
    if (this.noteForm.invalid) return;
    this.submittingNote = true;
    const note: CrmNote = { ...this.noteForm.value, leadId: this.leadId };
    this.notesService.addNote(this.leadId, note).subscribe({
      next: () => {
        this.submittingNote = false;
        this.showNoteForm = false;
        this.noteForm.reset({ type: 'NOTE' });
        this.loadNotes();
      },
      error: () => { this.submittingNote = false; }
    });
  }

  /** Sauvegarder les modifications du lead */
  saveEdit(): void {
    if (this.editForm.invalid) return;
    this.submittingEdit = true;
    this.leadsService.updateLead(this.leadId, this.editForm.value).subscribe({
      next: (res) => {
        this.submittingEdit = false;
        if (res.success) {
          this.lead = res.data;
          this.showEditForm = false;
        }
      },
      error: () => { this.submittingEdit = false; }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard/crm/leads']);
  }

  getStars(score: number): number[] {
    return Array(score || 0).fill(0);
  }

  getEmptyStars(score: number): number[] {
    return Array(5 - (score || 0)).fill(0);
  }

  getNoteLabel(type: string): string {
    switch (type) {
      case 'APPEL': return 'Appel';
      case 'EMAIL': return 'Email';
      case 'RDV':   return 'Rendez-vous';
      case 'NOTE':  return 'Note';
      default:      return type;
    }
  }

  getNoteIcon(type: string): string {
    switch (type) {
      case 'APPEL': return 'fas fa-phone';
      case 'EMAIL': return 'fas fa-envelope';
      case 'RDV':   return 'fas fa-calendar-check';
      case 'NOTE':  return 'fas fa-sticky-note';
      default:      return 'fas fa-sticky-note';
    }
  }
}
