import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Service suivi missions clients (amélioration 10).
 */
@Injectable({ providedIn: 'root' })
export class MissionService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Espace Client ──
  getMissionsClient(clientId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/missions/client/${clientId}`);
  }

  // ── Admin ──
  creerMission(clientId: number, mission: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/missions/client/${clientId}`, mission);
  }

  mettreAJourPhase(missionId: number, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/missions/${missionId}/phase`, payload);
  }

  ajouterAvis(missionId: number, commentaire: string, note: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/missions/${missionId}/avis`, { commentaire, note });
  }

  getMissionsActives(): Observable<any> {
    return this.http.get(`${this.baseUrl}/missions/admin/actives`);
  }

  getAllMissions(): Observable<any> {
    return this.http.get(`${this.baseUrl}/missions/admin/all`);
  }
}
