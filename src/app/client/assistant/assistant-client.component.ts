import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../core/services/chatbot.service';
import { ClientService } from '../../core/services/client.service';

interface ChatMessage {
  texte: string;
  auteur: 'utilisateur' | 'bot';
  horodatage: Date;
}

@Component({
  selector: 'app-assistant-client',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assistant-client.component.html',
  styleUrls: ['./assistant-client.component.css']
})
export class AssistantClientComponent implements OnInit, AfterViewChecked {

  clientName = '';
  chatMessages: ChatMessage[] = [];
  chatInput = '';
  botTyping = false;
  private shouldScroll = false;

  suggestions = [
    { icon: 'fas fa-cogs', text: 'Quels services proposez-vous ?' },
    { icon: 'fas fa-calendar', text: 'Comment prendre rendez-vous ?' },
    { icon: 'fas fa-building', text: 'Parlez-moi de SYNEXA' },
    { icon: 'fas fa-file-invoice-dollar', text: 'Comment suivre ma facture ?' },
    { icon: 'fas fa-rocket', text: 'Où voir mes missions ?' },
    { icon: 'fas fa-comments', text: 'Comment contacter un consultant ?' },
  ];

  @ViewChild('chatContainer') chatContainer!: ElementRef;

  constructor(
    private chatbotService: ChatbotService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.clientName = this.clientService.getClientName();
    this.chatMessages.push({
      texte: `Bonjour ${this.clientName || ''}! Je suis l'assistant SYNEXA. Je peux vous aider avec vos questions sur nos services, vos factures, vos missions et bien plus encore. Comment puis-je vous aider aujourd'hui ?`,
      auteur: 'bot',
      horodatage: new Date()
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  sendMessage(event?: Event): void {
    if (event) event.preventDefault();
    const text = this.chatInput?.trim();
    if (!text || this.botTyping) return;

    this.chatMessages.push({ texte: text, auteur: 'utilisateur', horodatage: new Date() });
    this.chatInput = '';
    this.botTyping = true;
    this.shouldScroll = true;

    this.chatbotService.sendMessage(text).subscribe({
      next: (response: string) => {
        this.botTyping = false;
        this.chatMessages.push({ texte: response, auteur: 'bot', horodatage: new Date() });
        this.shouldScroll = true;
      },
      error: () => {
        this.botTyping = false;
        this.chatMessages.push({
          texte: 'Désolé, je suis temporairement indisponible. Veuillez réessayer plus tard.',
          auteur: 'bot',
          horodatage: new Date()
        });
        this.shouldScroll = true;
      }
    });
  }

  sendSuggestion(text: string): void {
    this.chatInput = text;
    this.sendMessage();
  }

  clearChat(): void {
    this.chatMessages = [];
    this.chatMessages.push({
      texte: `Bonjour ${this.clientName || ''}! Comment puis-je vous aider aujourd'hui ?`,
      auteur: 'bot',
      horodatage: new Date()
    });
  }

  private scrollToBottom(): void {
    try {
      const el = this.chatContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
