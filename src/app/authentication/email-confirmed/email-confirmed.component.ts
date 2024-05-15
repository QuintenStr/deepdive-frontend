import { Component } from '@angular/core';
import { AuthenticationService } from '../../shared/service/authentication.service';
import { EmailVerification } from '../../shared/interface/request/emailverificationinputdto.model';
import { AppToastService } from '../../shared/service/toast.service';
import { TokenRefreshDto } from '../../shared/interface/request/tokenrefreshdto.model';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthResponseDto } from '../../shared/interface/response/authresponsedto.model';

@Component({
  selector: 'app-email-confirmed',
  templateUrl: './email-confirmed.component.html',
  styleUrl: './email-confirmed.component.scss',
})
export class EmailConfirmedComponent {
  constructor(
    protected authService: AuthenticationService,
    private toastService: AppToastService,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) {}

  resendEmail(): void {
    const emailInput: EmailVerification = {
      Email: this.authService.getEmail(),
    };

    this.authService.ResendValidationEmail(emailInput).subscribe({
      next: () => {
        this.toastService.show(
          'Success',
          'A new confirmation mail has been sent.'
        );
      },
      error: () => {
        this.toastService.show('Oepsie', 'Something went wrong.');
      },
    });
  }

  validateAgain(): void {
    const inputrefresh: TokenRefreshDto = {
      AccessToken: this.authService.getToken(),
      RefreshToken: this.authService.getRefreshToken(),
    };

    this.authService.refreshToken(inputrefresh).subscribe({
      next: (response: AuthResponseDto) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshtoken', response.refreshToken);

        const decodedToken = this.jwtHelper.decodeToken(response.token);

        if (
          decodedToken &&
          Object.prototype.hasOwnProperty.call(decodedToken, 'EmailVerified') &&
          decodedToken.EmailVerified == 'false'
        ) {
          this.toastService.show('Oepsie', 'Email is not yet confirmed.');
        } else {
          this.toastService.show('Success', 'Email has been verified.');
          this.router.navigate(['home']);
        }

        this.authService.sendAuthStateChangeNotification(
          response.isAuthSuccessful
        );
      },
      error: () => {
        this.toastService.show('Oepsie', 'Something went wrong.');
      },
    });
  }
}
