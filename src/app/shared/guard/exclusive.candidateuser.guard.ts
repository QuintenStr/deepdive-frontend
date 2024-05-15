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
export class ExclusiveCandidateUserGuard implements CanActivate {
  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.isUserCandidateUser()) {
      return true;
    } else {
      this.router.navigate(['/forbidden']);
      return false;
    }
  }
}
