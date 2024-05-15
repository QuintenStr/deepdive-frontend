import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthTokenInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token');

      if (token) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    } else {
      console.error('localStorage is not available. Unable to retrieve token.');
    }

    return next.handle(request);
  }
}
