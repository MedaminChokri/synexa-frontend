import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiResponse } from '../../models/api-response.model';
import { environment } from '../../../environments/environment';

export interface Client {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  motDePasse?: string;
  entreprise?: string;
  telephone?: string;
  actif?: boolean;
  dateInscription?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  signup(client: Client): Observable<ApiResponse<Client>> {
    return this.http.post<ApiResponse<Client>>(`${this.baseUrl}/clients/signup`, client);
  }

  /**
   * Login : retourne maintenant { token, client } depuis le backend.
   * Le token JWT CLIENT est stocké dans localStorage sous 'clientToken'.
   */
  login(email: string, motDePasse: string): Observable<ApiResponse<{ token: string; client: Client }>> {
    return this.http.post<ApiResponse<{ token: string; client: Client }>>(
      `${this.baseUrl}/clients/login`,
      { email, motDePasse }
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          const { token, client } = response.data;
          localStorage.setItem('clientToken', token);
          localStorage.setItem('clientId', client.id!.toString());
          localStorage.setItem('clientNom', `${client.prenom} ${client.nom}`);
          localStorage.setItem('clientEmail', client.email);
          localStorage.setItem('clientUser', JSON.stringify(client));
        }
      })
    );
  }

  forgotPassword(email: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/clients/forgot-password`, { email });
  }

  resetPassword(token: string, nouveauPassword: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/clients/reset-password`, {
      token,
      nouveau_password: nouveauPassword
    });
  }

  logout(): void {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientId');
    localStorage.removeItem('clientNom');
    localStorage.removeItem('clientEmail');
    localStorage.removeItem('clientUser');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('clientId') && !!localStorage.getItem('clientToken');
  }

  getClientId(): string | null {
    return localStorage.getItem('clientId');
  }

  getClientName(): string {
    return localStorage.getItem('clientNom') || 'Client';
  }

  // ── CRUD basique ────────────────────────────────────────────────────────────

  getAll(): Observable<ApiResponse<Client[]>> {
    return this.http.get<ApiResponse<Client[]>>(`${this.baseUrl}/clients`);
  }

  getById(id: number): Observable<ApiResponse<Client>> {
    return this.http.get<ApiResponse<Client>>(`${this.baseUrl}/clients/${id}`);
  }

  update(id: number, client: Client): Observable<ApiResponse<Client>> {
    return this.http.put<ApiResponse<Client>>(`${this.baseUrl}/clients/${id}`, client);
  }

  // ── Espace client — endpoints manquants (WARN 6 fix) ─────────────────────

  /** PUT /api/clients/{id}/profil — mise à jour partielle (nom, prénom, tel, entreprise) */
  mettreAJourProfil(id: number, details: Partial<Client>): Observable<ApiResponse<Client>> {
    return this.http.put<ApiResponse<Client>>(`${this.baseUrl}/clients/${id}/profil`, details);
  }

  /** PUT /api/clients/{id}/password — changer le mot de passe */
  changerMotDePasse(id: number, ancienPassword: string, nouveauPassword: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.baseUrl}/clients/${id}/password`, {
      ancien_password: ancienPassword,
      nouveau_password: nouveauPassword
    });
  }

  /** GET /api/clients/{id}/demandes — historique contacts + RDV */
  getDemandes(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/clients/${id}/demandes`);
  }

  /** GET /api/clients/{id}/historique — timeline chronologique complète */
  getHistorique(id: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/clients/${id}/historique`);
  }

  /** GET /api/clients/{id}/analytics — métriques calculées */
  getAnalytics(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/clients/${id}/analytics`);
  }

  toggleActif(id: number): Observable<ApiResponse<Client>> {
    return this.http.patch<ApiResponse<Client>>(`${this.baseUrl}/clients/${id}/actif`, {});
  }

  deleteClient(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/clients/${id}`);
  }
}

