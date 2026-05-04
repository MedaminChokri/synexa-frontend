import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Service de gestion des notifications client (amélioration 7).
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getNotifications(clientId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/clients/${clientId}/notifications`);
  }

  compterNonLues(clientId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/clients/${clientId}/notifications/count`);
  }

  marquerLue(clientId: number, notifId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/clients/${clientId}/notifications/${notifId}/lu`, {});
  }

  marquerToutesLues(clientId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/clients/${clientId}/notifications/tout-lire`, {});
  }

  getDernieres(clientId: number, limit: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/clients/${clientId}/notifications?limit=${limit}`);
  }
}
