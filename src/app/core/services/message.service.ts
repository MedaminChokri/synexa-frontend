import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MessageService {

  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Client: conversation unique (Direct Message) ──

  getOuCreerConversation(clientId: number): Observable<any> {
    return this.http.get(`${this.base}/messages/client/${clientId}/conversation`);
  }

  getConversationsClient(clientId: number): Observable<any> {
    return this.http.get(`${this.base}/messages/client/${clientId}/conversations`);
  }

  creerConversation(clientId: number, sujet: string, premierMessage: string): Observable<any> {
    return this.http.post(`${this.base}/messages/client/${clientId}/conversations`, {
      sujet,
      premier_message: premierMessage
    });
  }

  getConversation(convId: number): Observable<any> {
    return this.http.get(`${this.base}/messages/conversations/${convId}`);
  }

  envoyerMessage(convId: number, contenu: string, expediteurType: string, expediteurNom: string): Observable<any> {
    return this.http.post(`${this.base}/messages/conversations/${convId}`, {
      contenu,
      expediteur_type: expediteurType,
      expediteur_nom: expediteurNom
    });
  }

  uploaderFichier(convId: number, file: File, expediteurType: string, expediteurNom: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('convId', String(convId));
    formData.append('expediteurType', expediteurType);
    formData.append('expediteurNom', expediteurNom);
    return this.http.post(`${this.base}/messages/upload`, formData);
  }

  // ── Admin ──

  getAllConversations(): Observable<any> {
    return this.http.get(`${this.base}/messages/admin/conversations`);
  }

  getNonLusAdmin(): Observable<any> {
    return this.http.get(`${this.base}/messages/admin/non-lus`);
  }

  creerConversationDepuisContact(contactId: number): Observable<any> {
    return this.http.post(`${this.base}/messages/admin/from-contact/${contactId}`, {});
  }

  marquerMessagesLus(convId: number): Observable<any> {
    return this.http.put(`${this.base}/messages/conversations/${convId}/lus`, {});
  }

  marquerConversationNonLue(convId: number): Observable<any> {
    return this.http.put(`${this.base}/messages/conversations/${convId}/non-lus`, {});
  }
}
