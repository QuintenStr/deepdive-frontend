import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EndpointService } from './endpoint.service';
import { Subject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router, ActivatedRoute } from '@angular/router';
import { UserForAuthenticationDto } from './../interface/request/userforauthenticationdto.model';
import { TokenRefreshDto } from './../interface/request/tokenrefreshdto.model';
import { AuthResponseDto } from './../interface/response/authresponsedto.model';
import { firstValueFrom } from 'rxjs';
import { UserForRegistrationDto } from '../interface/request/userforregistrationdto.model';
import { EmailConfirmationUserId } from '../interface/request/emailidvalidationdto.model';
import { ValidateEmailAndUserIdResponse } from '../interface/response/validateemailwithidresponsedto.model';
import { EmailVerification } from '../interface/request/emailverificationinputdto.model';
import { ValidatePasswordResetDto } from '../interface/request/validatepasswordresetdto.model';
import { UpdateUserPasswordDto } from '../interface/request/updateuserpassworddto.model';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authChangeSub = new Subject<boolean>();
  public authChanged = this.authChangeSub.asObservable();

  constructor(
    private http: HttpClient,
    private envUrl: EndpointService,
    private jwtHelper: JwtHelperService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  public loginUser = (body: UserForAuthenticationDto) => {
    return this.http.post<AuthResponseDto>(this.envUrl.loginEndpoint, body, {
      headers: { 'Show-Loading': 'true' },
    });
  };

  public registerUser = (body: UserForRegistrationDto) => {
    return this.http.post<AuthResponseDto>(this.envUrl.registerEndpoint, body, {
      headers: { 'Show-Loading': 'true' },
    });
  };

  public refreshToken = (body: TokenRefreshDto) => {
    return this.http.post<AuthResponseDto>(this.envUrl.refreshEndpoint, body, {
      headers: { 'Show-Loading': 'true' },
    });
  };

  public ResendValidationEmail = (body: EmailVerification) => {
    return this.http.post<unknown>(this.envUrl.ResendEmailVerification, body, {
      headers: { 'Show-Loading': 'true' },
    });
  };

  public validatePassword = (body: UserForAuthenticationDto) => {
    return this.http.post<AuthResponseDto>(
      this.envUrl.validateCurrentPassword,
      body,
      { headers: { 'Show-Loading': 'true' } }
    );
  };

  public validateEmailWithId = (body: EmailConfirmationUserId) => {
    return this.http.post<ValidateEmailAndUserIdResponse>(
      this.envUrl.validateEmailandId,
      body,
      { headers: { 'Show-Loading': 'true' } }
    );
  };

  public validatePasswordReset = (body: ValidatePasswordResetDto) => {
    return this.http.post<unknown>(this.envUrl.validatePasswordReset, body, {
      headers: { 'Show-Loading': 'true' },
    });
  };

  public updatePassword = (body: UpdateUserPasswordDto) => {
    return this.http.post<unknown>(this.envUrl.updatePassword, body, {
      headers: { 'Show-Loading': 'true' },
    });
  };

  public sendAuthStateChangeNotification = (isAuthenticated: boolean) => {
    this.authChangeSub.next(isAuthenticated);
  };

  public logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshtoken');
    this.sendAuthStateChangeNotification(false);
    this.router.navigate(['/auth/login']);
  };

  public getToken(): string {
    const token = localStorage.getItem('token');

    if (token === null) {
      return '';
    }

    return token;
  }

  public getRefreshToken(): string {
    const token = localStorage.getItem('refreshtoken');

    if (token === null) {
      return '';
    }

    return token;
  }

  public getEmail(): string {
    const token = localStorage.getItem('token');

    if (token === null) {
      return '';
    }
    const decodedToken = this.jwtHelper.decodeToken(token);

    const email =
      decodedToken[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
      ];
    return email;
  }

  public getId(): string {
    const token = localStorage.getItem('token');

    if (token === null) {
      return '';
    }
    const decodedToken = this.jwtHelper.decodeToken(token);

    const id =
      decodedToken[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ];
    return id;
  }

  public isUserAuthenticated = async (): Promise<boolean> => {
    if (typeof localStorage === 'undefined') {
      // localStorage is not available (possibly running on the server side)
      return false;
    }

    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshtoken');

    if (token === null || refreshToken === null) {
      return false;
    }

    if (!this.jwtHelper.isTokenExpired(token)) {
      return true;
    } else {
      try {
        const response = await firstValueFrom(
          this.refreshToken({ AccessToken: token, RefreshToken: refreshToken })
        );

        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshtoken', response.refreshToken);
        this.sendAuthStateChangeNotification(response.isAuthSuccessful);
        return response.isAuthSuccessful;
      } catch (error) {
        console.error('Error refreshing token:', error);
        this.logout();
        return false;
      }
    }
  };

  public isEmailConfirmed(): boolean {
    if (typeof localStorage === 'undefined') {
      // localStorage is not available (possibly running on the server side)
      return false;
    }

    const token = localStorage.getItem('token');

    if (token === null) {
      return false;
    }

    const decodedToken = this.jwtHelper.decodeToken(token);

    if (
      decodedToken &&
      Object.prototype.hasOwnProperty.call(decodedToken, 'EmailVerified') &&
      decodedToken.EmailVerified == 'false'
    ) {
      return false;
    } else {
      return true;
    }
  }

  public isUserAdmin = (): boolean => {
    if (typeof localStorage === 'undefined') {
      // localStorage is not available (possibly running on the server side)
      return false;
    }

    const token = localStorage.getItem('token');
    if (token === null) {
      return false;
    }

    const decodedToken = this.jwtHelper.decodeToken(token);
    const role =
      decodedToken[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ];

    return role === 'Administrator';
  };

  public isUserCandidateUser = (): boolean => {
    const token = localStorage.getItem('token');
    if (token === null) {
      return false;
    }
    const decodedToken = this.jwtHelper.decodeToken(token);
    const role =
      decodedToken[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ];
    return role === 'CandidateUser';
  };
}
