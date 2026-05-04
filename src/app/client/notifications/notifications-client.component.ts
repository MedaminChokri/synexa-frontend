import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-client.component.html',
  styleUrls: ['./notifications-client.component.css']
})
export class NotificationsClientComponent implements OnInit {
  notifications: any[] = [];
  loading = false;
  clientId = 0;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const stored = localStorage.getItem('clientUser');
    if (stored) {
      this.clientId = JSON.parse(stored).id;
      this.loadNotifications();
    }
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications(this.clientId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.notifications = res.data;
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  marquerCommeLue(notif: any): void {
    if (notif.lu) return;
    this.notificationService.marquerLue(this.clientId, notif.id).subscribe(() => {
      notif.lu = true;
      if (notif.lien) {
        this.router.navigateByUrl(notif.lien);
      }
    });
  }

  marquerToutLu(): void {
    const nonLues = this.notifications.filter(n => !n.lu);
    if (nonLues.length === 0) return;
    this.notificationService.marquerToutesLues(this.clientId).subscribe({
      next: () => { this.notifications.forEach(n => n.lu = true); },
      error: () => {
        nonLues.forEach(n => {
          this.notificationService.marquerLue(this.clientId, n.id).subscribe(() => { n.lu = true; });
        });
      }
    });
  }

  getIcone(type: string): string {
    switch(type) {
      case 'MESSAGE': return 'fa-envelope text-blue-500';
      case 'RDV': return 'fa-calendar text-orange-500';
      case 'CONTRAT': return 'fa-file-signature text-green-500';
      case 'MISSION': return 'fa-rocket text-purple-500';
      case 'DOCUMENT': return 'fa-folder text-yellow-500';
      default: return 'fa-bell text-gray-400';
    }
  }

  getBgColor(type: string): string {
    switch(type) {
      case 'MESSAGE': return 'rgba(59, 130, 246, 0.1)';
      case 'RDV': return 'rgba(249, 115, 22, 0.1)';
      case 'CONTRAT': return 'rgba(16, 185, 129, 0.1)';
      case 'MISSION': return 'rgba(139, 92, 246, 0.1)';
      case 'DOCUMENT': return 'rgba(234, 179, 8, 0.1)';
      default: return 'rgba(156, 163, 175, 0.1)';
    }
  }
}
