import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ContactService } from '../../core/services/contact.service';
import { RendezVousService } from '../../core/services/rendez-vous.service';
import { MissionService } from '../../core/services/mission.service';
import { environment } from '../../../environments/environment';

interface KpiCard {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  bgColor: string;
  trend?: string;
  trendClass?: string;
  route?: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.css'
})
export class DashboardHomeComponent implements OnInit {
  loading = true;

  kpiCards: KpiCard[] = [];
  recentContacts: any[] = [];
  recentRendezVous: any[] = [];

  constructor(
    private contactService: ContactService,
    private rendezVousService: RendezVousService,
    private missionService: MissionService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading = true;
    forkJoin({
      contacts: this.contactService.getAll(),
      rendezVous: this.rendezVousService.getAll(),
      missions: this.missionService.getAllMissions(),
      clients: this.http.get<any>(`${environment.apiUrl}/clients`)
    }).subscribe({
      next: (res: any) => {
        const contacts = (res.contacts?.data || []).filter((c: any) => !c.client);
        const rendezVous = res.rendezVous?.data || [];
        const missions = res.missions?.data || res.missions || [];
        const clients = res.clients?.data || res.clients || [];

        const unreadContacts = contacts.filter((c: any) => !c.client && !c.lu).length;
        const confirmedRdv = rendezVous.filter((r: any) => r.statut === 'CONFIRME').length;
        const pendingRdv = rendezVous.filter((r: any) => r.statut === 'EN_ATTENTE').length;
        const missionsEnCours = missions.filter((m: any) => m.statut === 'EN_COURS').length;
        const missionsTerminees = missions.filter((m: any) => m.statut === 'TERMINE').length;
        const clientsActifs = clients.filter((c: any) => c.actif !== false).length;

        this.kpiCards = [
          {
            label: 'Rendez-vous',
            value: rendezVous.length,
            icon: 'fas fa-calendar-alt',
            color: '#f97316',
            bgColor: 'rgba(249,115,22,0.1)',
            trend: `${confirmedRdv} confirmés · ${pendingRdv} en attente`,
            route: '/admin/dashboard/rendezvous'
          },
          {
            label: 'Clients actifs',
            value: clientsActifs,
            icon: 'fas fa-users',
            color: '#3b82f6',
            bgColor: 'rgba(59,130,246,0.1)',
            trend: `${clients.length} total inscrits`,
            route: '/admin/dashboard/crm/clients'
          },
          {
            label: 'Missions en cours',
            value: missionsEnCours,
            icon: 'fas fa-rocket',
            color: '#8b5cf6',
            bgColor: 'rgba(139,92,246,0.1)',
            trend: `${missionsTerminees} terminées`,
            route: '/admin/dashboard/missions-clients'
          },
          {
            label: 'Messages non lus',
            value: unreadContacts,
            icon: 'fas fa-envelope-open-text',
            color: '#10b981',
            bgColor: 'rgba(16,185,129,0.1)',
            trend: `${contacts.length} contacts total`,
            trendClass: unreadContacts > 0 ? 'trend-alert' : '',
            route: '/admin/dashboard/messages-clients'
          }
        ];

        const safeTime = (obj: any): number => {
          const d = obj.dateCreation || obj.dateEnvoi || obj.date;
          if (!d) return 0;
          const t = new Date(d).getTime();
          return isNaN(t) ? 0 : t;
        };

        this.recentContacts = [...contacts]
          .sort((a: any, b: any) => safeTime(b) - safeTime(a))
          .slice(0, 5);

        this.recentRendezVous = [...rendezVous]
          .sort((a: any, b: any) => safeTime(b) - safeTime(a))
          .slice(0, 5);

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      EN_ATTENTE: 'En attente',
      CONFIRME: 'Confirmé',
      ANNULE: 'Annulé'
    };
    return labels[statut] || statut;
  }

  getStatutClass(statut: string): string {
    const classes: Record<string, string> = {
      EN_ATTENTE: 'status-pending',
      CONFIRME: 'status-confirmed',
      ANNULE: 'status-cancelled'
    };
    return classes[statut] || 'status-pending';
  }
}
