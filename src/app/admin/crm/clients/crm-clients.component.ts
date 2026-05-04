import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService, Client } from '../../../core/services/client.service';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-crm-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crm-clients.component.html',
  styleUrl: './crm-clients.component.css'
})
export class CrmClientsComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  loading = true;
  searchQuery = '';
  filterActif: 'all' | 'actif' | 'inactif' = 'all';
  isAdmin = false;

  constructor(
    private clientService: ClientService,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.adminService.isAdmin();
    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    this.clientService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.clients = res.data;
          this.applyFilters();
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters(): void {
    let result = [...this.clients];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(c =>
        (c.nom + ' ' + c.prenom).toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.entreprise || '').toLowerCase().includes(q)
      );
    }
    if (this.filterActif === 'actif') result = result.filter(c => c.actif !== false);
    if (this.filterActif === 'inactif') result = result.filter(c => c.actif === false);
    this.filteredClients = result;
  }

  onSearch(): void {
    this.applyFilters();
  }

  goToFiche(clientId: number | undefined): void {
    if (clientId) {
      this.router.navigate(['/admin/dashboard/fiche-client', clientId]);
    }
  }

  getInitials(client: Client): string {
    return ((client.prenom?.[0] || '') + (client.nom?.[0] || '')).toUpperCase() || 'C';
  }

  toggleActif(client: Client, event: Event): void {
    event.stopPropagation();
    if (!client.id) return;
    this.clientService.toggleActif(client.id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          client.actif = res.data.actif;
          this.applyFilters();
        }
      }
    });
  }

  deleteClient(client: Client, event: Event): void {
    event.stopPropagation();
    if (!client.id) return;
    if (!confirm(`Supprimer définitivement ${client.prenom} ${client.nom} ?`)) return;
    this.clientService.deleteClient(client.id).subscribe({
      next: () => {
        this.clients = this.clients.filter(c => c.id !== client.id);
        this.applyFilters();
      }
    });
  }
}
