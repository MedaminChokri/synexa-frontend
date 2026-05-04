import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../models/api-response.model';

/**
 * Service pour le dashboard CRM — récupération des KPIs.
 */
@Injectable({
  providedIn: 'root'
})
export class CrmDashboardService {

  constructor(private apiService: ApiService) {}

  /** Récupérer les KPIs du dashboard CRM */
  getKpis(): Observable<ApiResponse<any>> {
    return this.apiService.get<any>('crm/dashboard/kpis');
  }
}
