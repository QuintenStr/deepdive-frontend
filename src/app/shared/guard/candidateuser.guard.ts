import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthenticationService } from './../service/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class CandidateUserGuard implements CanActivate {
  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (await this.authService.isUserCandidateUser()) {
      this.router.navigate(['/auth/register-complete'], {
        queryParams: { returnUrl: state.url },
      });

      return false;
    } else {
      return true;
    }
  }
}
