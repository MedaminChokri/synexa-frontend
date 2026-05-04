import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AdminService } from '../services/admin.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private adminService: AdminService, private router: Router) {}

  canActivate(): boolean {
    // Vérifie AUSSI la présence du token (pas seulement le flag boolean)
    const isLoggedIn = this.adminService.isLoggedIn();
    const hasToken = !!localStorage.getItem('admin_token');
    if (isLoggedIn && hasToken) {
      return true;
    }
    // Nettoyer si état incohérent
    if (isLoggedIn && !hasToken) {
      localStorage.removeItem('admin_logged_in');
    }
    this.router.navigate(['/login']);
    return false;
  }
}
