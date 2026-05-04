/**
 * chatbot-widget.component.ts
 * Widget de chat flottant SYNEXA — version simple.
 */

import {
  Component, OnInit,
  ViewChild, ElementRef, AfterViewChecked
} from '@angular/core';
import { ChatbotService } from '../../../core/services/chatbot.service';

interface Message {
  texte:  string;
  auteur: 'utilisateur' | 'bot';
}

const SUGGESTIONS_INITIALES = [
  'Que faites-vous ?',
  'Vos services ?',
  'Comment vous contacter ?',
  'Vos tarifs ?',
];

@Component({
  selector: 'app-chatbot-widget',
  templateUrl: './chatbot-widget.component.html',
  styleUrls: ['./chatbot-widget.component.css']
})
export class ChatbotWidgetComponent implements OnInit, AfterViewChecked {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('inputRef')          inputRef!: ElementRef;

  estOuvert            = false;
  saisieUtilisateur    = '';
  messages: Message[]  = [];
  botEnCours           = false;
  suggestions          = SUGGESTIONS_INITIALES;
  afficherSuggestions  = true;

  private doitScroller = false;

  private readonly messageBienvenue =
    'Bonjour ! Je suis l\'assistant virtuel SYNEXA. Comment puis-je vous aider ?';

  constructor(private chatbotSvc: ChatbotService) {}

  ngOnInit(): void {
    this.ajouterMessageBot(this.messageBienvenue);
  }

  ngAfterViewChecked(): void {
    if (this.doitScroller) {
      this.scrollerVersLeBas();
      this.doitScroller = false;
    }
  }

  // ── Contrôle du widget ────────────────────────────────────────────────────

  basculerChat(): void {
    this.estOuvert = !this.estOuvert;
    if (this.estOuvert) {
      this.doitScroller = true;
      setTimeout(() => this.inputRef?.nativeElement?.focus(), 150);
    }
  }

  fermerChat(): void {
    this.estOuvert = false;
  }

  nouvelleConversation(): void {
    this.messages = [];
    this.afficherSuggestions = true;
    this.botEnCours = false;
    this.saisieUtilisateur = '';
    this.ajouterMessageBot(this.messageBienvenue);
  }

  // ── Envoi de message ──────────────────────────────────────────────────────

  envoyerMessage(): void {
    const texte = this.saisieUtilisateur.trim();
    if (!texte || this.botEnCours) return;

    this.afficherSuggestions = false;
    this.ajouterMessageUtilisateur(texte);
    this.saisieUtilisateur = '';
    this.botEnCours = true;
    this.doitScroller = true;

    this.chatbotSvc.sendMessage(texte).subscribe(reponse => {
      this.ajouterMessageBot(reponse);
      this.botEnCours = false;
    });
  }

  utiliserSuggestion(suggestion: string): void {
    this.saisieUtilisateur = suggestion;
    this.envoyerMessage();
  }

  onToucheEnfoncee(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.envoyerMessage();
    }
  }

  // ── Méthodes privées ──────────────────────────────────────────────────────

  private ajouterMessageUtilisateur(texte: string): void {
    this.messages.push({ texte, auteur: 'utilisateur' });
    this.doitScroller = true;
  }

  private ajouterMessageBot(texte: string): void {
    this.messages.push({ texte, auteur: 'bot' });
    this.doitScroller = true;
  }

  private scrollerVersLeBas(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch { /* ignore */ }
  }
}
