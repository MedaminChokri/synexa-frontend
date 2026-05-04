import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ClientAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    try {
      const clientId    = localStorage.getItem('clientId');
      const clientUser  = localStorage.getItem('clientUser');
      const clientToken = localStorage.getItem('clientToken');

      if (clientId && clientUser && clientToken) {
        const user = JSON.parse(clientUser);
        if (user && user.id && !this.isTokenExpired(clientToken)) {
          return true;
        }
        // Token expiré — purger le stockage
        this.clearSession();
      }
    } catch (e) {
      this.clearSession();
    }
    this.router.navigate(['/login']);
    return false;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // `exp` is in seconds, Date.now() in milliseconds
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private clearSession(): void {
    localStorage.removeItem('clientId');
    localStorage.removeItem('clientUser');
    localStorage.removeItem('clientToken');
  }
}

