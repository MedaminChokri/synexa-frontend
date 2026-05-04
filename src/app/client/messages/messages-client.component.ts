import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../core/services/message.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-messages-client',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages-client.component.html',
  styleUrls: ['./messages-client.component.css']
})
export class MessagesClientComponent implements OnInit, OnDestroy, AfterViewChecked {

  conversation: any = null;
  messages: any[] = [];
  newMessage = '';
  uploading = false;

  clientId = 0;
  clientName = '';

  @ViewChild('chatScroll') chatScroll!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;
  shouldScroll = false;

  private pollSub?: Subscription;

  constructor(
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const stored = localStorage.getItem('clientUser');
    if (stored) {
      const client = JSON.parse(stored);
      this.clientId = client.id;
      this.clientName = (client.prenom || '') + ' ' + (client.nom || '');
      this.initConversation();
    }

    this.route.queryParams.subscribe(params => {
      if (params['sujet']) {
        this.newMessage = `[Concerne: ${params['sujet']}] `;
      }
    });

    // Poll messages every 10s
    this.pollSub = interval(10000).subscribe(() => {
      if (this.conversation) this.loadMessages();
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.chatScroll) {
      this.chatScroll.nativeElement.scrollTop = this.chatScroll.nativeElement.scrollHeight;
      this.shouldScroll = false;
    }
  }

  initConversation(): void {
    this.messageService.getOuCreerConversation(this.clientId).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.conversation = res.data;
          this.loadMessages();
        }
      }
    });
  }

  loadMessages(): void {
    if (!this.conversation) return;
    this.messageService.getConversation(this.conversation.id).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.messages = res.data.messages || [];
          this.shouldScroll = true;
          this.cdr.detectChanges();
        }
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.conversation) return;
    const content = this.newMessage;
    this.newMessage = '';

    this.messageService.envoyerMessage(this.conversation.id, content, 'CLIENT', this.clientName.trim()).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.messages.push(res.data);
          this.shouldScroll = true;
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
    if (!file || !this.conversation) return;

    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      alert('Seuls les images et PDF sont acceptés.');
      return;
    }

    this.uploading = true;
    this.messageService.uploaderFichier(this.conversation.id, file, 'CLIENT', this.clientName.trim()).subscribe({
      next: (res: any) => {
        this.uploading = false;
        if (res.success) {
          this.messages.push(res.data);
          this.shouldScroll = true;
        }
        event.target.value = '';
      },
      error: () => {
        this.uploading = false;
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

  openFile(url: string): void {
    window.open(url, '_blank');
  }
}
