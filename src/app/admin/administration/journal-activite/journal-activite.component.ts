import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

export interface JournalEntry {
  id: number;
  utilisateur: string;
  action: string;
  entite: string;
  details: string;
  dateAction: string;
  niveau: 'INFO' | 'ATTENTION' | 'CRITIQUE';
}

@Component({
  selector: 'app-journal-activite',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './journal-activite.component.html',
  styleUrls: ['./journal-activite.component.css']
})
export class JournalActiviteComponent implements OnInit {

  entries: JournalEntry[] = [];
  filtered: JournalEntry[] = [];
  loading = true;
  errorMsg = '';

  searchTerm = '';
  niveauFilter = '';
  entiteFilter = '';

  private apiUrl = 'http://localhost:8080/api/journal';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadJournal();
  }

  loadJournal(): void {
    this.loading = true;
    this.http.get<any>(this.apiUrl).subscribe({
      next: (res) => {
        this.entries = res.data || res || [];
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        // Données de démonstration si le backend n'est pas encore prêt
        this.entries = this.getMockData();
        this.applyFilters();
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let result = [...this.entries];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(e =>
        (e.utilisateur || '').toLowerCase().includes(term) ||
        (e.action || '').toLowerCase().includes(term) ||
        (e.details || '').toLowerCase().includes(term) ||
        (e.entite || '').toLowerCase().includes(term)
      );
    }
    if (this.niveauFilter) {
      result = result.filter(e => e.niveau === this.niveauFilter);
    }
    if (this.entiteFilter) {
      result = result.filter(e => e.entite === this.entiteFilter);
    }
    this.filtered = result;
  }

  getNiveauColor(niveau: string): string {
    const map: Record<string, string> = {
      INFO: '#3b82f6', ATTENTION: '#f59e0b', CRITIQUE: '#ef4444'
    };
    return map[niveau] || '#6b7280';
  }

  getNiveauIcon(niveau: string): string {
    const map: Record<string, string> = {
      INFO: 'fas fa-info-circle', ATTENTION: 'fas fa-exclamation-triangle', CRITIQUE: 'fas fa-shield-alt'
    };
    return map[niveau] || 'fas fa-circle';
  }

  getUniqueEntites(): string[] {
    return [...new Set(this.entries.map(e => e.entite))];
  }

  private getMockData(): JournalEntry[] {
    return [
      { id: 1, utilisateur: 'Sahby', action: 'VALIDATION_CONTRAT', entite: 'Contrat', details: 'Validation du contrat #CTR-2024-042 (Client: SoftCorp)', dateAction: new Date().toISOString(), niveau: 'INFO' },
      { id: 2, utilisateur: 'Admin', action: 'SUPPRESSION_UTILISATEUR', entite: 'Utilisateur', details: 'Suppression du compte utilisateur: karim.ben@synexa.com', dateAction: new Date(Date.now() - 3600000).toISOString(), niveau: 'CRITIQUE' },
      { id: 3, utilisateur: 'Mehdi', action: 'CREATION_MISSION', entite: 'Mission', details: 'Nouvelle mission créée: Audit SI - Client TechVision', dateAction: new Date(Date.now() - 7200000).toISOString(), niveau: 'INFO' },
      { id: 4, utilisateur: 'Admin', action: 'MODIFICATION_ROLE', entite: 'Utilisateur', details: 'Rôle de yasmine.triki modifié: CONSULTANT → MANAGER', dateAction: new Date(Date.now() - 86400000).toISOString(), niveau: 'ATTENTION' },
      { id: 5, utilisateur: 'Sahby', action: 'ENVOI_CONTRAT', entite: 'Contrat', details: 'Contrat envoyé au client InnoTech pour signature', dateAction: new Date(Date.now() - 172800000).toISOString(), niveau: 'INFO' },
    ];
  }
}
