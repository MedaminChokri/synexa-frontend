import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../models/api-response.model';
import { environment } from '../../../environments/environment';
import { Utilisateur } from '../../models/utilisateur.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(email: string, motDePasse: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/utilisateurs/login`, { email, motDePasse }).pipe(
      tap(response => {
        if (response.success && response.data && response.data.token) {
          localStorage.setItem('admin_logged_in', 'true');
          localStorage.setItem('admin_token', response.data.token);
          localStorage.setItem('admin_username', response.data.nom);
          localStorage.setItem('admin_role', response.data.role);
          localStorage.setItem('user_id', response.data.id.toString());
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    localStorage.removeItem('admin_role');
    localStorage.removeItem('admin_email');
    localStorage.removeItem('user_id');
  }

  getToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  getUsername(): string {
    return localStorage.getItem('admin_username') || 'Utilisateur';
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('admin_logged_in') === 'true';
  }

  isAdmin(): boolean {
    return localStorage.getItem('admin_role') === 'ADMIN';
  }

  isSuperAdmin(): boolean {
    // Kept for nav group logic — ADMIN has all privileges
    return localStorage.getItem('admin_role') === 'ADMIN';
  }

  isManager(): boolean {
    // Kept for nav group logic — ADMIN has all privileges
    return localStorage.getItem('admin_role') === 'ADMIN';
  }

  isConsultant(): boolean {
    return localStorage.getItem('admin_role') === 'CONSULTANT';
  }

  getRoleBadgeColor(): string {
    const role = localStorage.getItem('admin_role');
    return role === 'ADMIN' ? '#1e3a5f' : '#6b7280';
  }

  getRoleLabel(): string {
    const role = localStorage.getItem('admin_role');
    return role === 'ADMIN' ? 'Administrateur' : 'Consultant';
  }

  getRoleBadgeStyle(): { background: string; color: string } {
    const role = localStorage.getItem('admin_role');
    if (role === 'ADMIN') return { background: 'rgba(196,149,42,0.12)', color: '#C4952A' };
    return { background: 'rgba(107,114,128,0.12)', color: '#9ca3af' };
  }

  getRole(): string {
    return localStorage.getItem('admin_role') || 'CONSULTANT';
  }
}
