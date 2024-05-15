import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AppToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService implements HttpInterceptor {
  constructor(private router: Router, private toastService: AppToastService) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = this.handleError(error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  private handleError = (error: HttpErrorResponse): string => {
    if (error.status === 404) {
      return this.handleNotFound(error);
    } else if (error.status === 400) {
      return this.handleBadRequest(error);
    } else if (error.status === 401) {
      return this.handleUnauthorized(error);
    } else if (error.status === 403) {
      return this.handleForbidden(error);
    }

    return 'An unexpected error occurred';
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleForbidden = (error: HttpErrorResponse) => {
    this.router.navigate(['/forbidden'], {
      queryParams: { returnUrl: this.router.url },
    });

    return 'Forbidden';
  };

  private handleNotFound = (error: HttpErrorResponse): string => {
    this.router.navigate(['/404']);
    return error.message;
  };

  private handleUnauthorized = (error: HttpErrorResponse) => {
    if (this.router.url.startsWith('/auth/login')) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorResponse = error as any;
      if (errorResponse.error.errorMessage === 'Deleted User') {
        return 'User has been disabled.';
      }
      return 'Wrong email or password :(';
    } else if (this.router.url.startsWith('/auth/view-application')) {
      this.router.navigate(['/forbidden'], {});
      return error.message;
    } else {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return error.message;
    }
  };

  private handleBadRequest = (error: HttpErrorResponse): string => {
    if (this.router.url.startsWith('/admin/excursion-edit')) {
      const message = 'Something went wrong';
      return message;
    }
    if (this.router.url.startsWith('/admin/excursion-add')) {
      let message = '';
      // Assuming error.error.errors is an object with string values
      const values: string[] = Object.values(error.error.errors);

      values.forEach((m: string) => {
        message += m + '<br>';
      });

      return message.slice(0, -4);
    }
    if (this.router.url.startsWith('/auth/complete-pwd')) {
      let message = '';
      // Assuming error.error.errors is an object with string values
      const values: string[] = Object.values(error.error.errors);

      values.forEach((m: string) => {
        message += m + '<br>';
      });

      return message.slice(0, -4);
    }
    if (this.router.url === '/auth/register') {
      let message = '';
      // Assuming error.error.errors is an object with string values
      const values: string[] = Object.values(error.error.errors);

      values.forEach((m: string) => {
        message += m + '<br>';
      });

      return message.slice(0, -4);
    }
    if (this.router.url === '/auth/view-application') {
      let message = '';
      const values: string[] = Object.values(error.error.errors);

      values.forEach((m: string) => {
        message += m + '<br>';
      });

      return message.slice(0, -4);
    }
    if (this.router.url.startsWith('/admin/users')) {
      let message = '';
      const values: string[] = Object.values(error.error.errors);

      values.forEach((m: string) => {
        message += m + '<br>';
      });

      return message.slice(0, -4);
    }
    if (this.router.url.startsWith('/auth/confirm-email')) {
      let message = '';
      const values: string[] = Object.values(error.error.errors);

      values.forEach((m: string) => {
        message += m + '<br>';
      });
      return message.slice(0, -4);
    } else {
      return error.error ? error.error : error.message;
    }
  };
}
