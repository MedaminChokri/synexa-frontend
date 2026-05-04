import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../../core/services/client.service';
import { ContactService } from '../../core/services/contact.service';
import { RendezVousService } from '../../core/services/rendez-vous.service';
import { ChatbotService } from '../../core/services/chatbot.service';
import { MissionService } from '../../core/services/mission.service';
import { ContratService } from '../../core/services/contrat.service';
import { DocumentClientService } from '../../core/services/document-client.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MessageService } from '../../core/services/message.service';

interface ChatMessage {
  texte: string;
  auteur: 'utilisateur' | 'bot';
  horodatage: Date;
}

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-espace-client',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './espace-client.component.html',
  styleUrls: ['./espace-client.component.css']
})
export class EspaceClientComponent implements OnInit, AfterViewChecked {
  activeTab = 'overview';
  clientName = '';
  clientEmail = '';
  clientId = 0;
  contacts: any[] = [];
  rendezvous: any[] = [];
  loading = false;
  contactForm: FormGroup;
  msgForm: FormGroup;
  contactSuccess = '';
  contactError = '';
  msgSuccess = '';

  prochainRdv: any = null;
  missionActive: any = null;

  demandesCount = 0;
  missionsProgression = 0;
  dernierContratStatut = 'Aucun contrat';
  documentsCount = 0;
  facturesMontantAttente = 0;
  messagesNonLus = 0;

  readonly servicesList = [
    'Conseil Stratégique',
    'Transformation Digitale',
    'Gestion de Projet',
    'Data Analytics',
    'Intelligence Artificielle',
    'Audit & Conformité',
    'Formation sur Mesure',
    'Autre'
  ];

  // Chatbot
  chatMessages_list: ChatMessage[] = [];
  chatInput = '';
  botTyping = false;
  private shouldScrollChat = false;

  @ViewChild('chatMessages') chatMessagesRef!: ElementRef;

  // FAQ
  faqs: FaqItem[] = [
    {
      question: 'Comment suivre le statut de ma demande ?',
      answer: 'Allez dans l\'onglet "Mes Demandes" pour voir le statut de toutes vos demandes. Les demandes lues sont marquées en vert.',
      open: false
    },
    {
      question: 'Combien de temps pour obtenir une réponse ?',
      answer: 'Notre équipe s\'engage à répondre dans un délai de 24 à 48 heures ouvrables.',
      open: false
    },
    {
      question: 'Puis-je modifier une demande envoyée ?',
      answer: 'Oui, tant que la demande est en attente, vous pouvez envoyer un message via la messagerie avec la référence de la demande.',
      open: false
    },
    {
      question: 'Comment fonctionne l\'assistant IA ?',
      answer: 'Notre assistant IA est basé sur l\'intelligence artificielle et peut répondre à vos questions sur nos services, notre entreprise et vous guider dans vos démarches.',
      open: false
    }
  ];

  constructor(
    private clientService: ClientService,
    private contactService: ContactService,
    private rendezVousService: RendezVousService,
    private chatbotService: ChatbotService,
    private missionService: MissionService,
    private contratService: ContratService,
    private documentService: DocumentClientService,
    private messageService: MessageService,
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.contactForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      entreprise: [''],
      service: ['', Validators.required],
      message: ['', Validators.required],
      dateRendezVous: ['']
    });
    this.msgForm = this.fb.group({
      sujet: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const stored = localStorage.getItem('clientUser');
    if (stored) {
      const client = JSON.parse(stored);
      this.clientName = client.prenom + ' ' + client.nom;
      this.clientEmail = client.email;
      this.clientId = client.id;
      this.contactForm.patchValue({
        nom: this.clientName,
        email: this.clientEmail,
        telephone: client.telephone || '',
        entreprise: client.entreprise || ''
      });
    } else {
      this.clientName = this.clientService.getClientName();
      this.clientEmail = localStorage.getItem('clientEmail') || '';
    }

    this.loadDemandes();
    this.loadDynamicData();
    this.loadWidgetsData();

    this.chatMessages_list.push({
      texte: `Bonjour ${this.clientName || ''}! Je suis l'assistant SYNEXA. Comment puis-je vous aider aujourd'hui ?`,
      auteur: 'bot',
      horodatage: new Date()
    });
  }

  loadWidgetsData(): void {
    if (!this.clientId) return;

    this.http.get<any>(`${environment.apiUrl}/clients/${this.clientId}/demandes`).subscribe((res: any) => {
      if (res.success && res.data) {
        this.demandesCount = res.data.total || 0;
      }
    });

    this.missionService.getMissionsClient(this.clientId).subscribe((res: any) => {
      if (res.success && res.data && res.data.length > 0) {
        const activeMissions = res.data.filter((m: any) => m.statut === 'EN_COURS');
        this.missionsProgression = activeMissions.length > 0
          ? activeMissions[0].progression
          : res.data[0].progression;
      }
    });

    this.contratService.getContratsClient(this.clientId).subscribe((res: any) => {
      if (res.success && res.data && res.data.length > 0) {
        this.dernierContratStatut = res.data[0].statut;
      }
    });

    this.documentService.getDocuments(this.clientId).subscribe((res: any) => {
      if (res.success && res.data) {
        this.documentsCount = res.data.length;
      }
    });

    this.http.get<any>(`${environment.apiUrl}/clients/${this.clientId}/factures`).subscribe((res: any) => {
      if (res.success && res.data) {
        this.facturesMontantAttente = res.data
          .filter((f: any) => f.statut === 'EN_ATTENTE' || f.statut === 'EN_RETARD')
          .reduce((sum: number, f: any) => sum + f.montantTTC, 0);
      }
    });

    this.messageService.getConversationsClient(this.clientId).subscribe((res: any) => {
      if (res.success && Array.isArray(res.data)) {
        this.messagesNonLus = res.data.filter((c: any) => c.nonLus > 0).length;
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollChat) {
      this.scrollChatToBottom();
      this.shouldScrollChat = false;
    }
  }

  loadDemandes(): void {
    if (!this.clientEmail) return;
    this.loading = true;
    this.contactService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.contacts = res.data.filter((c: any) => c.email === this.clientEmail);
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
    this.rendezVousService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.rendezvous = res.data.filter((r: any) => r.email === this.clientEmail);
        }
      }
    });
  }

  loadDynamicData(): void {
    this.rendezVousService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const now = new Date();
          const meRdvs = res.data.filter((r: any) =>
            r.email?.toLowerCase() === this.clientEmail?.toLowerCase() &&
            r.statut !== 'ANNULE' && r.statut !== 'TERMINE'
          );
          const avecDateFuture = meRdvs
            .filter((r: any) => r.dateRendezVous && new Date(r.dateRendezVous) > now)
            .sort((a: any, b: any) => new Date(a.dateRendezVous).getTime() - new Date(b.dateRendezVous).getTime());
          if (avecDateFuture.length > 0) {
            this.prochainRdv = avecDateFuture[0];
          } else {
            const confirmes = meRdvs.filter((r: any) => r.statut === 'CONFIRME');
            this.prochainRdv = confirmes[0] || meRdvs[0] || null;
          }
        }
      },
      error: () => {}
    });

    const stored = localStorage.getItem('clientUser');
    if (stored) {
      const clientId = JSON.parse(stored).id;
      this.missionService.getMissionsClient(clientId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const active = res.data.find((m: any) => m.statut === 'EN_COURS');
            this.missionActive = active || res.data[0] || null;
          }
        },
        error: () => {}
      });
    }
  }

  getConfirmedCount(): number {
    return this.rendezvous.filter(r => r.confirme || r.statut === 'CONFIRME').length;
  }

  getPendingCount(): number {
    return this.rendezvous.filter(r => !r.confirme && r.statut !== 'CONFIRME' && r.statut !== 'ANNULE').length;
  }

  submitContact(): void {
    if (this.contactForm.invalid) return;
    this.contactError = '';
    const data = this.contactForm.value;
    this.contactService.sendContactForm(data).subscribe({
      next: (res) => {
        if (res.success) {
          this.contactSuccess = 'Votre demande a été envoyée avec succès !';
          this.contactForm.reset();
          setTimeout(() => {
            this.contactSuccess = '';
            this.activeTab = 'demandes';
            this.loadDemandes();
          }, 2000);
        }
      },
      error: () => { this.contactError = 'Erreur lors de l\'envoi'; }
    });
  }

  submitMessage(): void {
    if (this.msgForm.invalid) return;
    const { sujet, message } = this.msgForm.value;
    const payload = {
      nom: this.clientName || 'Client',
      email: this.clientEmail,
      message: `[${sujet}] ${message}`
    };
    this.contactService.sendContactForm(payload as any).subscribe({
      next: () => {
        this.msgSuccess = 'Message envoyé ! Notre équipe vous répondra dans les plus brefs délais.';
        this.msgForm.reset();
        this.loadDemandes();
        setTimeout(() => this.msgSuccess = '', 4000);
      },
      error: () => {
        this.msgSuccess = 'Erreur lors de l\'envoi. Veuillez réessayer.';
        setTimeout(() => this.msgSuccess = '', 4000);
      }
    });
  }

  openChatbot(): void {
    this.shouldScrollChat = true;
  }

  sendChatMessage(event: Event): void {
    event.preventDefault();
    const text = this.chatInput?.trim();
    if (!text || this.botTyping) return;

    this.chatMessages_list.push({ texte: text, auteur: 'utilisateur', horodatage: new Date() });
    this.chatInput = '';
    this.botTyping = true;
    this.shouldScrollChat = true;

    this.chatbotService.sendMessage(text).subscribe({
      next: (response: string) => {
        this.botTyping = false;
        this.chatMessages_list.push({ texte: response, auteur: 'bot', horodatage: new Date() });
        this.shouldScrollChat = true;
      },
      error: () => {
        this.botTyping = false;
        this.chatMessages_list.push({
          texte: 'Désolé, je suis temporairement indisponible. Veuillez réessayer plus tard.',
          auteur: 'bot',
          horodatage: new Date()
        });
        this.shouldScrollChat = true;
      }
    });
  }

  sendSuggestion(text: string): void {
    this.chatInput = text;
    this.sendChatMessage(new Event('submit'));
  }

  private scrollChatToBottom(): void {
    try {
      const el = this.chatMessagesRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch { }
  }

  formatDateMonth(d: string): string {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }); }
    catch { return d; }
  }

  logout(): void {
    this.clientService.logout();
    this.router.navigate(['/login']);
  }
}
