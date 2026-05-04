/**
 * chatbot.service.ts
 * Service Angular pour le chatbot SYNEXA — appels HTTP simples.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface BotResponse {
  response: string;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {

  private readonly apiUrl = environment.chatbotUrl; // http://localhost:5000/chat

  private readonly msgIndispo =
    'Désolé, je suis temporairement indisponible. Veuillez réessayer plus tard.';

  constructor(private http: HttpClient) {}

  /**
   * Envoie un message au chatbot et retourne la réponse.
   */
  sendMessage(message: string): Observable<string> {
    return this.http.post<BotResponse>(this.apiUrl, { message }).pipe(
      map(res => res.response),
      catchError(() => of(this.msgIndispo))
    );
  }
}
