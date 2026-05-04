import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AdminService } from '../../core/services/admin.service';
import { RendezVousService } from '../../core/services/rendez-vous.service';
import { MessageService } from '../../core/services/message.service';
import { environment } from '../../../environments/environment';

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface NavItem {
  key: string;
  label: string;
  icon: string;
  route: string;
  badgeCount?: number;
  iconColor?: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  sidebarOpen = true;
  activeSection = 'home';
  adminUsername = '';
  adminRole = '';
  currentDate = new Date();
  currentDateStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  navGroups: NavGroup[] = [];
  private sub: Subscription = new Subscription();
  private intervalId: any;

  // Mon compte
  showAccountModal = false;
  savingAccount = false;
  accountSuccess = '';
  accountError = '';
  accountForm = { nom: '', email: '', motDePasse: '', motDePasseConfirm: '' };

  constructor(
    public adminService: AdminService,
    private router: Router,
    private http: HttpClient,
    private rendezVousService: RendezVousService,
    private messageService: MessageService
  ) {
    this.initNavGroups();
  }

  initNavGroups(): void {
    const isSuperAdmin = this.adminService.isSuperAdmin();
    const isManager = this.adminService.isManager();
    const isConsultant = this.adminService.isConsultant();

    this.adminRole = this.adminService.getRoleLabel();

    const homeGroup: NavGroup = {
      label: 'ACCUEIL',
      items: [
        { key: 'home', label: 'Tableau de bord', icon: 'fas fa-home', route: '/admin/dashboard', iconColor: '#C4952A' }
      ]
    };

    // CRM pur — acquisition & suivi commercial
    const crmItems: NavItem[] = [
      { key: 'crm-dashboard', label: 'Dashboard CRM', icon: 'fas fa-chart-line', route: '/admin/dashboard/crm/dashboard', iconColor: '#C4952A' },
      { key: 'crm-clients', label: 'Clients', icon: 'fas fa-address-book', route: '/admin/dashboard/crm/clients', iconColor: '#C4952A' },
      { key: 'crm-leads', label: 'Leads', icon: 'fas fa-users', route: '/admin/dashboard/crm/leads', iconColor: '#3b82f6' },
      { key: 'crm-agenda', label: 'Agenda', icon: 'fas fa-calendar-alt', route: '/admin/dashboard/crm/agenda', iconColor: '#10b981' },
    ];

const crmGroup: NavGroup = { label: 'CRM', items: crmItems };

    // Gestion Clients — missions, factures, contrats
    const gestionItems: NavItem[] = [
      { key: 'missions-clients', label: 'Missions Clients', icon: 'fas fa-rocket', route: '/admin/dashboard/missions-clients', iconColor: '#8b5cf6' },
      { key: 'factures-clients', label: 'Factures', icon: 'fas fa-file-invoice-dollar', route: '/admin/dashboard/factures-clients', iconColor: '#10b981' },
    ];

const gestionGroup: NavGroup = { label: 'GESTION CLIENTS', items: gestionItems };

    const communicationGroup: NavGroup = {
      label: 'COMMUNICATION',
      items: [
        { key: 'rendezvous', label: 'Rendez-vous', icon: 'fas fa-calendar-alt', route: '/admin/dashboard/rendezvous', iconColor: '#f97316', badgeCount: 0 },
        { key: 'messages-clients', label: 'Communications', icon: 'fas fa-comments', route: '/admin/dashboard/messages-clients', iconColor: '#3b82f6', badgeCount: 0 }
      ]
    };

    // Groups visible selon le rôle
    this.navGroups = [homeGroup, crmGroup, gestionGroup];

    // Communication — accessible à tous (ADMIN et CONSULTANT)
    this.navGroups.push(communicationGroup);

    // RH — visible pour Super Admin uniquement
    if (isSuperAdmin) {
      this.navGroups.push({
        label: 'RESSOURCES HUMAINES',
        items: [
          {
            key: 'ressources-humaines',
            label: 'Équipe & Utilisateurs',
            icon: 'fas fa-users-cog',
            route: '/admin/dashboard/ressources-humaines',
            iconColor: '#8b5cf6'
          }
        ]
      });
    }

    // Administration — visible pour Super Admin uniquement
    if (isSuperAdmin) {
      this.navGroups.push({
        label: 'ADMINISTRATION',
        items: [
          { key: 'journal-activite', label: 'Journal d\'activité', icon: 'fas fa-history', route: '/admin/dashboard/journal-activite', iconColor: '#6366f1' }
        ]
      });
    }
  }

  ngOnInit(): void {
    this.adminUsername = this.adminService.getUsername();
    this.adminRole = this.adminService.getRoleLabel();
    this.sub.add(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
        this.updateActiveSection(e.urlAfterRedirects);
        this.loadCounts();
      })
    );
    this.updateActiveSection(this.router.url);
    this.loadCounts();

    // Auto refresh counts periodically
    this.intervalId = setInterval(() => this.loadCounts(), 30000);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    clearInterval(this.intervalId);
  }

  updateActiveSection(url: string): void {
    // Exact match for home route
    if (url === '/admin/dashboard' || url === '/admin/dashboard/') {
      this.activeSection = 'home';
      return;
    }
    for (const group of this.navGroups) {
      const found = group.items.find(item => item.key !== 'home' && url.includes(item.key));
      if (found) {
        this.activeSection = found.key;
        return;
      }
    }
  }

  loadCounts(): void {
    let unreadMessagesCount = 0;

    this.messageService.getNonLusAdmin().subscribe(res => {
      if (res.success && res.data) {
        unreadMessagesCount = res.data.nonLus || 0;
        const commGroup = this.navGroups.find(g => g.label === 'COMMUNICATION');
        if (commGroup) {
          const commItem = commGroup.items.find(i => i.key === 'messages-clients');
          if (commItem) commItem.badgeCount = unreadMessagesCount;
        }
      }
    });

    this.rendezVousService.getAll().subscribe(res => {
      if (res.success && res.data) {
        const pendingRdv = res.data.filter((r: any) => r.statut === 'EN_ATTENTE').length;
        const commGroup = this.navGroups.find(g => g.label === 'COMMUNICATION');
        if (commGroup) {
          const rdvItem = commGroup.items.find(i => i.key === 'rendezvous');
          if (rdvItem) rdvItem.badgeCount = pendingRdv;
        }
      }
    });

    // Badge contacts non lus sur Communications
    this.http.get<any>(`${environment.apiUrl}/contacts`).subscribe(res => {
      if (res.success && res.data) {
        const nonLus = res.data.filter((c: any) => !c.client && !c.lu).length;
        const commGroup = this.navGroups.find(g => g.label === 'COMMUNICATION');
        if (commGroup) {
          const commItem = commGroup.items.find(i => i.key === 'messages-clients');
          if (commItem) commItem.badgeCount = (commItem.badgeCount || 0) + nonLus;
        }
      }
    });
  }

  navigate(item: NavItem): void {
    this.activeSection = item.key;
    this.router.navigate([item.route]);
    if (window.innerWidth < 1024) this.sidebarOpen = false;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    localStorage.clear();          // Supprime TOUT (admin_token, admin_logged_in, clientToken, etc.)
    sessionStorage.clear();        // Supprime aussi le sessionStorage
    window.location.href = '/login'; // Redirection dure → Angular repart de zéro
  }

  openAccountModal(): void {
    const adminId = localStorage.getItem('user_id');
    this.accountForm = { nom: '', email: '', motDePasse: '', motDePasseConfirm: '' };
    this.accountSuccess = '';
    this.accountError = '';
    if (adminId) {
      this.http.get<any>(`${environment.apiUrl}/utilisateurs/${adminId}`).subscribe({
        next: (res) => {
          const u = res.data || res;
          this.accountForm.nom = u.nom || '';
          this.accountForm.email = u.email || '';
        }
      });
    }
    this.showAccountModal = true;
  }

  closeAccountModal(): void {
    this.showAccountModal = false;
  }

  saveAccount(): void {
    const adminId = localStorage.getItem('user_id');
    if (!adminId) { this.accountError = 'Session invalide.'; return; }
    if (!this.accountForm.email) { this.accountError = 'L\'email est obligatoire.'; return; }
    if (this.accountForm.motDePasse && this.accountForm.motDePasse !== this.accountForm.motDePasseConfirm) {
      this.accountError = 'Les mots de passe ne correspondent pas.';
      return;
    }
    this.savingAccount = true;
    this.accountError = '';

    const payload: any = {
      nom: this.accountForm.nom,
      email: this.accountForm.email,
      role: 'ADMIN',
      actif: true
    };
    if (this.accountForm.motDePasse) {
      payload.motDePasse = this.accountForm.motDePasse;
    }

    this.http.put<any>(`${environment.apiUrl}/utilisateurs/${adminId}`, payload).subscribe({
      next: (res) => {
        this.savingAccount = false;
        const u = res.data || res;
        localStorage.setItem('admin_username', u.nom || this.accountForm.email);
        localStorage.setItem('admin_email', u.email || this.accountForm.email);
        this.adminUsername = u.nom || this.accountForm.email;
        this.accountSuccess = 'Compte mis à jour avec succès !';
        this.accountForm.motDePasse = '';
        this.accountForm.motDePasseConfirm = '';
        setTimeout(() => { this.accountSuccess = ''; this.closeAccountModal(); }, 2000);
      },
      error: () => {
        this.savingAccount = false;
        this.accountError = 'Erreur lors de la mise à jour.';
      }
    });
  }
}
