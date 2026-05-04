import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Service contrats avec signature électronique (amélioration 12).
 */
@Injectable({ providedIn: 'root' })
export class ContratService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Admin ──
  envoyerContrat(clientId: number, contrat: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/contrats/client/${clientId}`, contrat);
  }

  // ── Espace Client ──
  getContratsClient(clientId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/contrats/client/${clientId}`);
  }

  getUrlVisualiser(contratId: number): string {
    return `${this.baseUrl}/contrats/${contratId}/visualiser`;
  }

  visualiserContrat(contratId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/contrats/${contratId}/visualiser`, { responseType: 'blob' });
  }

  signerContrat(contratId: number, signatureBase64: string, ipAddress: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/contrats/${contratId}/signer`, {
      signature_base64: signatureBase64,
      ip_address: ipAddress
    });
  }

  refuserContrat(contratId: number, motif: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/contrats/${contratId}/refuser`, { motif });
  }

  telechargerSigne(contratId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/contrats/${contratId}/telecharger-signe`, { responseType: 'blob' });
  }
}
