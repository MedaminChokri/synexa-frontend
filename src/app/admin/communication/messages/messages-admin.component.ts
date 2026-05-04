import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../../core/services/message.service';
import { RendezVousService } from '../../../core/services/rendez-vous.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-messages-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages-admin.component.html',
  styleUrls: ['./messages-admin.component.css']
})
export class MessagesAdminComponent implements OnInit, AfterViewChecked, OnDestroy {
  currentTab: 'messages' | 'contacts' = 'messages';

  // --- Messages state ---
  conversations: any[] = [];
  selectedConversation: any = null;
  messages: any[] = [];
  newMessage = '';
  uploadingFile = false;

  // --- Contacts state ---
  contacts: any[] = [];
  selectedContact: any = null;
  loadingContacts = false;
  showReplyForm = false;
  replySubjet = '';
  replyMessage = '';
  sendingReply = false;

  get contactsNonLus(): number {
    return this.contacts.filter(c => !c.lu).length;
  }

  @ViewChild('chatScroll') chatScroll!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;
  shouldScroll = false;

  // --- Polling ---
  private pollingSubscription?: Subscription;

  // --- RendezVous modal state ---
  showRdvModal = false;
  rdvForm = {
    dateHeure: '',
    duree: '30 min',
    lieuType: 'Visio (Lien à venir)',
    serviceChoisi: 'CONSEIL'
  };

  successMessage = '';
  errorMessage = '';

  constructor(
    private messageService: MessageService,
    private rendezVousService: RendezVousService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadConversations();
    this.loadContacts();
    this.pollingSubscription = interval(15000).subscribe(() => {
      this.loadConversations();
      this.loadContacts();
      const convId = this.selectedConversation?.id;
      if (convId) this.refreshMessages(convId);
    });
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }

  // --- Tabs ---
  switchTab(tab: 'messages' | 'contacts'): void {
    this.currentTab = tab;
    if (tab === 'contacts') this.loadContacts();
    else this.loadConversations();
  }

  // --- Contacts ---
  loadContacts(): void {
    this.loadingContacts = true;
    this.http.get<any>(`${environment.apiUrl}/contacts`).subscribe({
      next: (res) => {
        // Afficher seulement les contacts SANS compte client
        this.contacts = (res.data || []).filter((c: any) => !c.client);
        this.loadingContacts = false;
      },
      error: () => { this.loadingContacts = false; }
    });
  }

  openContact(c: any): void {
    this.selectedContact = c;
    this.showReplyForm = false;
    this.replySubjet = '';
    this.replyMessage = '';
    if (!c.lu) this.marquerContactLu(c);
  }

  closeContact(): void {
    this.selectedContact = null;
    this.showReplyForm = false;
  }

  marquerContactLu(c: any): void {
    this.http.put<any>(`${environment.apiUrl}/contacts/${c.id}/lu`, {}).subscribe({
      next: () => { c.lu = true; }
    });
  }

  toggleReplyForm(): void {
    this.showReplyForm = !this.showReplyForm;
  }

  envoyerReponseEmail(): void {
    if (!this.selectedContact || !this.replyMessage.trim()) return;
    this.sendingReply = true;
    this.http.post<any>(`${environment.apiUrl}/contacts/${this.selectedContact.id}/repondre`, {
      sujet: this.replySubjet || 'Votre demande',
      message: this.replyMessage
    }).subscribe({
      next: (res) => {
        this.sendingReply = false;
        if (res.success) {
          this.showReplyForm = false;
          this.replyMessage = '';
          this.replySubjet = '';
          if (this.selectedContact) this.selectedContact.repondu = true;
          this.successMessage = 'Email envoyé avec succès !';
          setTimeout(() => this.successMessage = '', 3000);
        } else {
          this.errorMessage = res.message || 'Erreur envoi email';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      },
      error: () => {
        this.sendingReply = false;
        this.errorMessage = 'Erreur réseau lors de l\'envoi';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  formatDate(d: any): string {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return d; }
  }

  get nonLusCount(): number {
    return this.conversations.reduce((acc, conv) => acc + (conv.adminNonLu || 0), 0);
  }

  // --- RendezVous logic ---
  openRdvModal(): void {
    this.showRdvModal = true;
    this.rdvForm = {
      dateHeure: '',
      duree: '30 min',
      lieuType: 'Visio (Lien à venir)',
      serviceChoisi: 'CONSEIL'
    };
  }

  closeRdvModal(): void {
    this.showRdvModal = false;
  }

  planifierRdv(): void {
    if (!this.rdvForm.dateHeure || !this.selectedConversation) return;

    const client = this.selectedConversation.client;
    const rdv = {
      nom: client.nom,
      email: client.email,
      telephone: client.telephone || '',
      entreprise: client.entreprise || '',
      serviceChoisi: this.rdvForm.serviceChoisi,
      dateRendezVous: this.rdvForm.dateHeure,
      message: `Créé via la messagerie. Durée: ${this.rdvForm.duree}. Lieu/Type: ${this.rdvForm.lieuType}`,
      statut: 'EN_ATTENTE'
    };

    this.rendezVousService.createRendezVous(rdv as any).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.closeRdvModal();
          const d = new Date(this.rdvForm.dateHeure);
          const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
          const msgContent = `📅 Rendez-vous planifié le ${dateStr}
Type : ${this.rdvForm.lieuType}
Service : ${this.rdvForm.serviceChoisi}
Durée : ${this.rdvForm.duree}`;

          this.newMessage = msgContent;
          this.sendMessage();
          this.successMessage = 'Rendez-vous planifié et message envoyé !';
          setTimeout(() => this.successMessage = '', 3000);
        }
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la création du rendez-vous.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  // --- Messages logic ---

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.chatScroll) {
      this.chatScroll.nativeElement.scrollTop = this.chatScroll.nativeElement.scrollHeight;
      this.shouldScroll = false;
    }
  }

  loadConversations(): void {
    this.messageService.getAllConversations().subscribe({
      next: (res: any) => {
        if (res.success) {
          const fresh: any[] = res.data || [];
          // Si une conversation est ouverte, forcer son badge à 0 (déjà lus)
          if (this.selectedConversation) {
            fresh.forEach(c => {
              if (c.id === this.selectedConversation.id) {
                c.adminNonLu = 0;
              }
            });
          }
          // Dédupliquer par client.id — garder la conversation la plus récente
          const seen = new Map<number, any>();
          for (const conv of fresh) {
            const clientId = conv.client?.id;
            if (clientId == null) continue;
            const existing = seen.get(clientId);
            if (!existing || new Date(conv.dateModification) > new Date(existing.dateModification)) {
              seen.set(clientId, conv);
            }
          }
          this.conversations = Array.from(seen.values());
          this.cdr.detectChanges();
        }
      }
    });
  }

  selectConversation(conv: any): void {
    this.selectedConversation = conv;
    // Effacer le badge immédiatement (UI instantanée)
    conv.adminNonLu = 0;
    this.cdr.detectChanges();
    // Charger les messages et marquer comme lu sur le serveur
    this.loadMessages(conv.id);
  }

  loadMessages(convId: number): void {
    // Marquer comme lu sur le serveur
    this.messageService.marquerMessagesLus(convId).subscribe();

    this.messageService.getConversation(convId).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.messages = res.data.messages || [];
          this.shouldScroll = true;
          this.cdr.detectChanges();
          this.loadConversations();
        }
      }
    });
  }

  refreshMessages(convId: number): void {
    this.messageService.getConversation(convId).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const newMessages = res.data.messages || [];
          if (newMessages.length !== this.messages.length) {
            this.messages = newMessages;
            this.shouldScroll = true;
            this.cdr.detectChanges();
          }
        }
      }
    });
  }

  marquerNonLu(conv: any, event: MouseEvent): void {
    event.stopPropagation();
    this.messageService.marquerConversationNonLue(conv.id).subscribe({
      next: () => {
        // Recharger pour avoir le vrai compteur
        this.loadConversations();
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedConversation) return;
    const content = this.newMessage;
    this.newMessage = '';
    const convId = this.selectedConversation.id;

    this.messageService.envoyerMessage(convId, content, 'ADMIN', 'Équipe SYNEXA').subscribe({
      next: (res: any) => {
        if (res.success) {
          this.messages.push(res.data);
          this.shouldScroll = true;
          // Marquer comme lu puis recharger — garder le badge à zéro
          this.messageService.marquerMessagesLus(convId).subscribe({
            next: () => {
              this.loadConversations();
              if (this.selectedConversation) this.selectedConversation.adminNonLu = 0;
            }
          });
        }
      }
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  triggerFileUpload(): void {
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file || !this.selectedConversation) return;

    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      alert('Seuls les images et PDF sont acceptés.');
      return;
    }

    this.uploadingFile = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('convId', String(this.selectedConversation.id));
    formData.append('expediteurType', 'ADMIN');
    formData.append('expediteurNom', 'Équipe SYNEXA');

    this.http.post(`${environment.apiUrl}/messages/upload`, formData).subscribe({
      next: (res: any) => {
        this.uploadingFile = false;
        if (res.success) {
          this.messages.push(res.data);
          this.shouldScroll = true;
        }
        event.target.value = '';
      },
      error: () => {
        this.uploadingFile = false;
        event.target.value = '';
      }
    });
  }

  isImage(contenu: string): boolean {
    return contenu?.startsWith('[IMG]');
  }

  isPdf(contenu: string): boolean {
    return contenu?.startsWith('[PDF]');
  }

  getFileUrl(contenu: string): string {
    return contenu?.replace(/^\[(IMG|PDF)\]/, '') || '';
  }

  getFileName(contenu: string): string {
    const url = this.getFileUrl(contenu);
    return url.split('/').pop() || 'fichier.pdf';
  }

  formatHeure(date: any): string {
    if (!date) return '';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  }

  getMsgReadTitle(msg: any): string {
    return msg?.lu ? 'Lu' : 'Non lu';
  }

  getDernierMessageApercu(conv: any): string {
    const msg: string = conv?.dernierMessage || '';
    if (!msg) return conv?.client?.email || '';
    if (msg.startsWith('[IMG]')) return '📷 Image';
    if (msg.startsWith('[PDF]')) return '📄 Document PDF';
    return msg.length > 40 ? msg.substring(0, 40) + '...' : msg;
  }
}
