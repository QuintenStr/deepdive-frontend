import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoadingService } from './loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Check if the request should trigger the loading indicator
    if (request.headers.get('Show-Loading') === 'true') {
      this.loadingService.show();
    }

    return next.handle(request).pipe(
      tap(
        event => {
          if (event instanceof HttpResponse) {
            // Check if the response should trigger hiding the loading indicator
            if (request.headers.get('Show-Loading') === 'true') {
              this.loadingService.hide();
            }
          }
        },
        () => {
          // Handle errors here if needed
          this.loadingService.hide();
        }
      )
    );
  }
}
