import { Component } from '@angular/core';
import { AuthenticationService } from '../../shared/service/authentication.service';
import { TokenRefreshDto } from '../../shared/interface/request/tokenrefreshdto.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AppToastService } from '../../shared/service/toast.service';
import { Router } from '@angular/router';
import { AuthResponseDto } from '../../shared/interface/response/authresponsedto.model';

@Component({
  selector: 'app-register-complete',
  templateUrl: './register-complete.component.html',
  styleUrl: './register-complete.component.scss',
})
export class RegisterCompleteComponent {
  constructor(
    protected authService: AuthenticationService,
    private jwtHelper: JwtHelperService,
    private toastService: AppToastService,
    private router: Router
  ) {}

  checkAgain(): void {
    const inputrefresh: TokenRefreshDto = {
      AccessToken: this.authService.getToken(),
      RefreshToken: this.authService.getRefreshToken(),
    };

    this.authService.refreshToken(inputrefresh).subscribe({
      next: (response: AuthResponseDto) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshtoken', response.refreshToken);

        this.router.navigate(['home']);
      },
      error: () => {
        this.toastService.show('Oepsie', 'Something went wrong.');
      },
    });
  }
}
