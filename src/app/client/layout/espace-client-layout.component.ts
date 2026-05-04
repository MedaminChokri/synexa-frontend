import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription, interval } from 'rxjs';
import { ClientService } from '../../core/services/client.service';
import { NotificationService } from '../../core/services/notification.service';
import { MessageService } from '../../core/services/message.service';

/**
 * Layout principal de l'espace client avec sidebar complète (toutes les améliorations).
 */
@Component({
  selector: 'app-espace-client-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './espace-client-layout.component.html',
  styleUrls: ['./espace-client-layout.component.css']
})
export class EspaceClientLayoutComponent implements OnInit, OnDestroy {

  clientName = '';
  clientId = 0;
  activeRoute = '';
  notifNonLues = 0;
  messagesNonLus = 0;
  notifOpen = false;
  dernieresNotifs: any[] = [];

  private subs = new Subscription();

  constructor(
    private clientService: ClientService,
    private notifService: NotificationService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clientName = this.clientService.getClientName();
    const stored = localStorage.getItem('clientUser');
    if (stored) {
      try {
        this.clientId = JSON.parse(stored).id;
      } catch (e) {
        localStorage.removeItem('clientUser');
        this.router.navigate(['/login']);
      }
    }

    // Surveiller la route active
    this.subs.add(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
        this.activeRoute = e.urlAfterRedirects;
      })
    );
    this.activeRoute = this.router.url;

    // Charger les badges
    this.chargerBadges();

    // Actualiser les badges toutes les 30 secondes
    this.subs.add(
      interval(30000).subscribe(() => this.chargerBadges())
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  chargerBadges(): void {
    if (!this.clientId) return;

    this.notifService.compterNonLues(this.clientId).subscribe({
      next: (res: any) => { if (res.success) this.notifNonLues = res.data?.nonLues || 0; },
      error: () => {}
    });

    this.notifService.getDernieres(this.clientId, 5).subscribe({
      next: (res: any) => { if (res.success) this.dernieresNotifs = res.data || []; },
      error: () => {}
    });

    this.messageService.getConversationsClient(this.clientId).subscribe({
      next: (res: any) => {
        if (res.success && Array.isArray(res.data)) {
          this.messagesNonLus = res.data.filter((c: any) => c.nonLus > 0).length;
        }
      },
      error: () => {}
    });
  }

  toggleNotifDropdown(): void {
    this.notifOpen = !this.notifOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notif-wrapper')) {
      this.notifOpen = false;
    }
  }

  isActive(route: string): boolean {
    return this.activeRoute.includes(route);
  }

  logout(): void {
    this.clientService.logout();
    this.router.navigate(['/login']);
  }
}
