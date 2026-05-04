import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Service documents clients (amélioration 9).
 */
@Injectable({ providedIn: 'root' })
export class DocumentClientService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  uploadDocument(clientId: number, document: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/documents/client/${clientId}`, document);
  }

  getDocuments(clientId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/documents/client/${clientId}`);
  }

  downloadDocument(docId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/documents/${docId}/download`, { responseType: 'blob' });
  }

  supprimerDocument(docId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/documents/${docId}`);
  }
}
