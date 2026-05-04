import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AdminService } from '../services/admin.service';

/**
 * Guard de rôle — vérifie si l'utilisateur a le rôle requis.
 * Usage dans les routes : data: { roles: ['SUPER_ADMIN', 'MANAGER'] }
 */
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private adminService: AdminService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles: string[] = route.data['roles'] || [];
    if (requiredRoles.length === 0) return true;

    const userRole = localStorage.getItem('admin_role') || '';

    // ADMIN a accès à tout
    if (userRole === 'ADMIN') return true;

    // Vérifier si le rôle de l'utilisateur est dans la liste requise
    if (requiredRoles.includes(userRole)) return true;

    // Rediriger vers le dashboard si accès refusé
    this.router.navigate(['/admin/dashboard']);
    return false;
  }
}
