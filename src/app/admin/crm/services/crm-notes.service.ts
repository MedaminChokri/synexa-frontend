import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../models/api-response.model';
import { CrmNote } from '../models/note.model';

/**
 * Service pour la gestion des notes CRM liées à un lead.
 */
@Injectable({
  providedIn: 'root'
})
export class CrmNotesService {

  constructor(private apiService: ApiService) {}

  /** Récupérer les notes d'un lead */
  getNotes(leadId: number): Observable<ApiResponse<CrmNote[]>> {
    return this.apiService.get<CrmNote[]>(`crm/leads/${leadId}/notes`);
  }

  /** Ajouter une note à un lead */
  addNote(leadId: number, note: CrmNote): Observable<ApiResponse<CrmNote>> {
    return this.apiService.post<CrmNote>(`crm/leads/${leadId}/notes`, note);
  }
}
