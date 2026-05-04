import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { ClientService } from '../services/client.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private adminService: AdminService,
    private clientService: ClientService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if ([401, 403].includes(err.status)) {
          // Ignorer les requêtes de login pour ne pas interférer avec le composant de connexion
          if (!request.url.includes('/login')) {
            if (this.adminService.isLoggedIn()) {
               this.adminService.logout();
               this.router.navigate(['/login']);
            } else if (this.clientService.isLoggedIn()) {
               this.clientService.logout();
               this.router.navigate(['/client/login']);
            } else {
               this.router.navigate(['/login']);
            }
          }
        }
        const error = err.error?.message || err.statusText;
        return throwError(() => new Error(error));
      })
    );
  }
}
