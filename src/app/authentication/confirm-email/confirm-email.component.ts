import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../shared/service/authentication.service';
import { Alert } from '../../shared/interface/alert.model';
import { EmailConfirmationUserId } from '../../shared/interface/request/emailidvalidationdto.model';
import { ValidateEmailAndUserIdResponse } from '../../shared/interface/response/validateemailwithidresponsedto.model';
import { HttpErrorResponse } from '@angular/common/http';
import { TokenRefreshDto } from '../../shared/interface/request/tokenrefreshdto.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthResponseDto } from '../../shared/interface/response/authresponsedto.model';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.scss',
})
export class ConfirmEmailComponent implements OnInit {
  constructor(
    private activeRouter: ActivatedRoute,
    protected authService: AuthenticationService,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) {}
  userEmail!: string;
  errorMessage: string = '';
  showError: boolean = false;
  alert: Alert | undefined;

  async ngOnInit(): Promise<void> {
    this.userEmail = this.activeRouter.snapshot.paramMap.get('email')!;

    try {
      const validateInput: EmailConfirmationUserId = {
        UserId: this.authService.getId(),
        Email: this.userEmail,
      };

      await this.validateEmailAndUserId(validateInput);
      await this.validateAgain();
    } catch (err) {
      this.handleError(err);
    }
  }

  validateEmailAndUserId(input: EmailConfirmationUserId): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.authService.validateEmailWithId(input).subscribe({
        next: (res: ValidateEmailAndUserIdResponse) => {
          if (res.EmailHasBeenConfirmed) {
            resolve();
          }
          reject();
        },
        error: (err: HttpErrorResponse) => {
          reject(err);
        },
      });
    });
  }

  refreshTokens(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const inputrefresh: TokenRefreshDto = {
        AccessToken: this.authService.getToken(),
        RefreshToken: this.authService.getRefreshToken(),
      };

      this.authService.refreshToken(inputrefresh).subscribe({
        next: (response: AuthResponseDto) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('refreshtoken', response.refreshToken);
          this.router.navigate(['home']);
          resolve();
        },
        error: (err: HttpErrorResponse) => {
          reject(err);
        },
      });
    });
  }

  validateAgain(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
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
            !(
              decodedToken &&
              Object.prototype.hasOwnProperty.call(
                decodedToken,
                'EmailVerified'
              ) &&
              decodedToken.EmailVerified == 'false'
            )
          ) {
            this.router.navigate(['home']);
          }
          resolve();
        },
        error: (err: HttpErrorResponse) => {
          reject(err);
        },
      });
    });
  }

  async continue(): Promise<void> {
    try {
      await this.validateAgain();
    } catch (err) {
      this.handleError(err);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleError(err: any): void {
    this.errorMessage = err.message;

    const alert: Alert = {
      type: 'danger',
      message: err.message,
    };

    this.alert = alert;
    this.showError = true;
  }
}
