import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Utilisateur } from '../../models/utilisateur.model';
import { ApiResponse } from '../../models/api-response.model';
import { LoginRequestDTO } from '../../models/login-request.model';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<ApiResponse<Utilisateur[]>> {
    return this.apiService.get<Utilisateur[]>('utilisateurs');
  }

  create(utilisateur: Utilisateur): Observable<ApiResponse<Utilisateur>> {
    return this.apiService.post<Utilisateur>('utilisateurs', utilisateur);
  }

  update(id: number, utilisateur: Partial<Utilisateur>): Observable<ApiResponse<Utilisateur>> {
    return this.apiService.put<Utilisateur>(`utilisateurs/${id}`, utilisateur);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`utilisateurs/${id}`);
  }

  login(loginRequest: LoginRequestDTO): Observable<ApiResponse<Utilisateur>> {
    return this.apiService.post<Utilisateur>('utilisateurs/login', loginRequest);
  }
}