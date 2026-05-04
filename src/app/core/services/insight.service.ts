import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Insight } from '../../models/insight.model';
import { ApiResponse } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class InsightService {
  constructor(private apiService: ApiService) {}

  getInsights(): Observable<ApiResponse<Insight[]>> {
    return this.apiService.get<Insight[]>('insights');
  }

  getInsightsByCategorie(categorie: string): Observable<ApiResponse<Insight[]>> {
    return this.apiService.get<Insight[]>(`insights/categorie/${categorie}`);
  }

  create(insight: Partial<Insight>): Observable<ApiResponse<Insight>> {
    return this.apiService.post<Insight>('insights', insight);
  }

  update(id: number, insight: Partial<Insight>): Observable<ApiResponse<Insight>> {
    return this.apiService.put<Insight>(`insights/${id}`, insight);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`insights/${id}`);
  }
}
