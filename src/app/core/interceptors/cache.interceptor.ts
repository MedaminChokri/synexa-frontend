import { Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';

const CACHED_URLS = ['/api/services', '/api/statistiques'];
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  response: HttpResponse<any>;
  expiry: number;
}

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, CacheEntry>();

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only cache GET requests on specific endpoints
    if (req.method !== 'GET') {
      this.invalidateRelated(req.url);
      return next.handle(req);
    }

    const isCacheable = CACHED_URLS.some(url => req.url.includes(url));
    if (!isCacheable) {
      return next.handle(req);
    }

    const cached = this.cache.get(req.url);
    if (cached && cached.expiry > Date.now()) {
      return of(cached.response.clone());
    }

    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.cache.set(req.url, { response: event.clone(), expiry: Date.now() + CACHE_TTL_MS });
        }
      })
    );
  }

  private invalidateRelated(url: string): void {
    CACHED_URLS.forEach(cached => {
      if (url.includes(cached.replace('/api/', ''))) {
        this.cache.forEach((_, key) => {
          if (key.includes(cached)) this.cache.delete(key);
        });
      }
    });
  }
}

