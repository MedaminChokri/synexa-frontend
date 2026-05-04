import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Service analytique client (amélioration 11).
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsClientService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAnalytics(clientId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/clients/${clientId}/analytics`);
  }

  getDemandes(clientId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/clients/${clientId}/demandes`);
  }

  getHistorique(clientId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/clients/${clientId}/historique`);
  }

  mettreAJourProfil(clientId: number, profil: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/clients/${clientId}/profil`, profil);
  }

  changerMotDePasse(clientId: number, ancienMdp: string, nouveauMdp: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/clients/${clientId}/password`, {
      ancien_password: ancienMdp,
      nouveau_password: nouveauMdp
    });
  }

  soumettreNotation(rdvId: number, note: number, commentaire: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/rendezvous/${rdvId}/notation`, { note, commentaire });
  }

  downloadConfirmationPdf(rdvId: number): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/rendezvous/${rdvId}/confirmation-pdf`, { responseType: 'blob' });
  }
}
