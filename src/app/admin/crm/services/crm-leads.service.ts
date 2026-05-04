import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../models/api-response.model';
import { CrmLead } from '../models/lead.model';

/**
 * Service pour la gestion des leads CRM.
 * Utilise l'ApiService existant pour communiquer avec /api/crm/leads.
 */
@Injectable({
  providedIn: 'root'
})
export class CrmLeadsService {
  private readonly endpoint = 'crm/leads';

  constructor(private apiService: ApiService) {}

  /** Récupérer tous les leads avec filtres optionnels */
  getLeads(etape?: string, source?: string): Observable<ApiResponse<CrmLead[]>> {
    let url = this.endpoint;
    const params: string[] = [];
    if (etape) params.push(`etape=${etape}`);
    if (source) params.push(`source=${source}`);
    if (params.length > 0) url += '?' + params.join('&');
    return this.apiService.get<CrmLead[]>(url);
  }

  /** Récupérer un lead par son ID */
  getLeadById(id: number): Observable<ApiResponse<CrmLead>> {
    return this.apiService.get<CrmLead>(`${this.endpoint}/${id}`);
  }

  /** Créer un nouveau lead */
  createLead(lead: CrmLead): Observable<ApiResponse<CrmLead>> {
    return this.apiService.post<CrmLead>(this.endpoint, lead);
  }

  /** Mettre à jour un lead */
  updateLead(id: number, lead: CrmLead): Observable<ApiResponse<CrmLead>> {
    return this.apiService.put<CrmLead>(`${this.endpoint}/${id}`, lead);
  }

  /** Changer l'étape d'un lead */
  updateEtape(id: number, etape: string): Observable<ApiResponse<CrmLead>> {
    return this.apiService.patch<CrmLead>(`${this.endpoint}/${id}/etape`, { etape });
  }

  /** Supprimer un lead */
  deleteLead(id: number): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /** Mettre à jour le score de probabilité */
  updateProbabilite(id: number, score: number): Observable<ApiResponse<CrmLead>> {
    return this.apiService.patch<CrmLead>(`${this.endpoint}/${id}/probabilite`, { score });
  }

  /** Récupérer les leads en stagnation */
  getLeadsStagnants(): Observable<ApiResponse<CrmLead[]>> {
    return this.apiService.get<CrmLead[]>(`${this.endpoint}/stagnation`);
  }

  /** Mettre à jour les tags d'un lead */
  updateTags(id: number, tags: string[]): Observable<ApiResponse<CrmLead>> {
    return this.apiService.post<CrmLead>(`${this.endpoint}/${id}/tags`, { tags });
  }

  /** Récupérer tous les tags */
  getAllTags(): Observable<ApiResponse<string[]>> {
    return this.apiService.get<string[]>('crm/leads/tags/tous');
  }

  /** Récupérer la timeline d'un lead */
  getTimeline(id: number): Observable<ApiResponse<any[]>> {
    return this.apiService.get<any[]>(`${this.endpoint}/${id}/timeline`);
  }
}
