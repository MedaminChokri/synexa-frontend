import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { RendezVous } from '../../models/rendez-vous.model';
import { ApiResponse } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class RendezVousService {
  constructor(private apiService: ApiService) {}

  createRendezVous(rendezVous: RendezVous): Observable<ApiResponse<RendezVous>> {
    return this.apiService.post<RendezVous>('rendezvous', rendezVous);
  }

  getAll(): Observable<ApiResponse<RendezVous[]>> {
    return this.apiService.get<RendezVous[]>('rendezvous');
  }

  updateStatut(id: number, statut: string): Observable<ApiResponse<RendezVous>> {
    return this.apiService.put<RendezVous>(`rendezvous/${id}/statut`, { statut });
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`rendezvous/${id}`);
  }
}