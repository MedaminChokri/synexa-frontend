import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../models/api-response.model';
import { CrmRendezVous } from '../models/crm-rendezvous.model';

/**
 * Service pour la gestion des rendez-vous CRM.
 */
@Injectable({
  providedIn: 'root'
})
export class CrmRendezVousService {
  private readonly endpoint = 'crm/rendezvous';

  constructor(private apiService: ApiService) {}

  /** Récupérer tous les RDV (avec filtre statut optionnel) */
  getAll(statut?: string): Observable<ApiResponse<CrmRendezVous[]>> {
    let url = this.endpoint;
    if (statut) url += `?statut=${statut}`;
    return this.apiService.get<CrmRendezVous[]>(url);
  }

  /** Créer un RDV */
  create(rdv: CrmRendezVous): Observable<ApiResponse<CrmRendezVous>> {
    return this.apiService.post<CrmRendezVous>(this.endpoint, rdv);
  }

  /** Modifier un RDV */
  update(id: number, rdv: CrmRendezVous): Observable<ApiResponse<CrmRendezVous>> {
    return this.apiService.put<CrmRendezVous>(`${this.endpoint}/${id}`, rdv);
  }

  /** Changer le statut d'un RDV */
  updateStatut(id: number, statut: string): Observable<ApiResponse<CrmRendezVous>> {
    return this.apiService.patch<CrmRendezVous>(`${this.endpoint}/${id}/statut`, { statut });
  }

  /** Supprimer un RDV */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}
