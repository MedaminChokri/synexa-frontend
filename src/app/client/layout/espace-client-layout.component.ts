import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { Subscription, interval } from 'rxjs';
import { ClientService } from '../../core/services/client.service';
import { NotificationService } from '../../core/services/notification.service';
import { MessageService } from '../../core/services/message.service';
import { LanguageService, AppLang } from '../../core/services/language.service';

@Component({
  selector: 'app-espace-client-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
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
  sidebarOpen = false;
  dernieresNotifs: any[] = [];

  private subs = new Subscription();

  constructor(
    private clientService: ClientService,
    private notifService: NotificationService,
    private messageService: MessageService,
    private router: Router,
    private languageService: LanguageService
  ) {}

  get currentLang(): AppLang {
    return this.languageService.currentLang;
  }

  setLang(lang: AppLang): void {
    this.languageService.use(lang);
  }

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

    this.subs.add(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
        this.activeRoute = e.urlAfterRedirects;
        // Ferme automatiquement la sidebar mobile après chaque navigation
        this.sidebarOpen = false;
      })
    );
    this.activeRoute = this.router.url;

    this.chargerBadges();

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

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
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
