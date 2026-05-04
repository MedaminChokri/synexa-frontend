import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RendezVousService } from '../../../core/services/rendez-vous.service';
import { MessageService } from '../../../core/services/message.service';
import { ClientService } from '../../../core/services/client.service';
import { RendezVous } from '../../../models/rendez-vous.model';

@Component({
  selector: 'app-rendezvous-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rendezvous-admin.component.html',
  styleUrl: './rendezvous-admin.component.css'
})
export class RendezVousAdminComponent implements OnInit {
  rendezVous: RendezVous[] = [];
  loading = true;

  // Message modal
  showMsgModal = false;
  rdvSelected: any = null;
  msgSujet = '';
  msgContenu = '';
  msgSending = false;
  msgSuccess = '';
  msgError = '';

  constructor(
    private rendezVousService: RendezVousService,
    private messageService: MessageService,
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRendezVous();
  }

  loadRendezVous(): void {
    this.loading = true;
    this.rendezVousService.getAll().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.rendezVous = response.data;
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  updateStatut(id: number | undefined, statut: string): void {
    if (!id) return;
    this.rendezVousService.updateStatut(id, statut).subscribe({
      next: (response: any) => {
        if (response.success) this.loadRendezVous();
      }
    });
  }

  deleteRendezVous(id: number | undefined): void {
    if (!id || !confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) return;
    this.rendezVousService.delete(id).subscribe({
      next: (response: any) => {
        if (response.success) this.loadRendezVous();
      }
    });
  }

  openMessageModal(rdv: any): void {
    this.rdvSelected = rdv;
    this.msgSujet = `Concernant votre rendez-vous - ${rdv.serviceChoisi || ''}`;
    this.msgContenu = '';
    this.msgSuccess = '';
    this.msgError = '';
    this.showMsgModal = true;
  }

  closeMsgModal(): void {
    this.showMsgModal = false;
    this.rdvSelected = null;
  }

  envoyerMessage(): void {
    if (!this.rdvSelected || !this.msgContenu.trim()) return;
    this.msgSending = true;
    this.msgError = '';

    // Find client by email, then create conversation
    this.clientService.getAll().subscribe({
      next: (res: any) => {
        const clients = res.data || [];
        const client = clients.find((c: any) =>
          c.email?.toLowerCase() === this.rdvSelected.email?.toLowerCase()
        );
        if (!client) {
          this.msgError = 'Cette personne n\'a pas encore de compte client. Vous pouvez la contacter directement par email : ' + this.rdvSelected?.email;
          this.msgSending = false;
          return;
        }
        this.messageService.creerConversation(client.id, this.msgSujet, this.msgContenu).subscribe({
          next: () => {
            this.msgSending = false;
            this.msgSuccess = 'Message envoyé ! Le client sera notifié.';
            setTimeout(() => {
              this.closeMsgModal();
              this.router.navigate(['/admin/dashboard/messages-clients']);
            }, 1500);
          },
          error: () => {
            this.msgSending = false;
            this.msgError = 'Erreur lors de l\'envoi du message.';
          }
        });
      },
      error: () => {
        this.msgSending = false;
        this.msgError = 'Erreur lors de la recherche du client.';
      }
    });
  }

  getStatusClass(statut: string | undefined): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'badge bg-warning text-dark';
      case 'CONFIRME': return 'badge bg-success';
      case 'ANNULE': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }
}
