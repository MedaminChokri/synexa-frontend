import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FactureService {

  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getFacturesClient(clientId: number): Observable<any> {
    return this.http.get(`${this.base}/clients/${clientId}/factures`);
  }

  creerFacture(clientId: number, facture: any): Observable<any> {
    return this.http.post(`${this.base}/clients/${clientId}/factures`, facture);
  }

  changerStatut(clientId: number, factureId: number, statut: string): Observable<any> {
    return this.http.patch(`${this.base}/clients/${clientId}/factures/${factureId}/statut?statut=${statut}`, {});
  }

  getPdf(clientId: number, factureId: number): Observable<any> {
    return this.http.get(`${this.base}/clients/${clientId}/factures/${factureId}/pdf`);
  }

  envoyerParEmail(clientId: number, factureId: number): Observable<any> {
    return this.http.post(`${this.base}/clients/${clientId}/factures/${factureId}/envoyer-email`, {});
  }

  /** Crée une session Stripe Checkout et retourne l'URL de redirection */
  payerStripe(clientId: number, factureId: number): Observable<any> {
    return this.http.post(`${this.base}/clients/${clientId}/factures/${factureId}/pay`, {});
  }

  /** Confirme un paiement après retour Stripe (success_url) */
  confirmerPaiement(clientId: number, sessionId: string): Observable<any> {
    return this.http.post(
      `${this.base}/clients/${clientId}/factures/confirm-payment?session_id=${encodeURIComponent(sessionId)}`,
      {}
    );
  }
}
