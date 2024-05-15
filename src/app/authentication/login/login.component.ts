import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../shared/service/authentication.service';
import { UserForAuthenticationDto } from '../../shared/interface/request/userforauthenticationdto.model';
import { AuthResponseDto } from '../../shared/interface/response/authresponsedto.model';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppToastService } from '../../shared/service/toast.service';
import { Alert } from '../../shared/interface/alert.model';
import { UserService } from '../../shared/service/user.service';
import { EmailInputDto } from '../../shared/interface/request/emailinputdto.model';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private returnUrl!: string;

  loginForm: FormGroup;
  errorMessage: string = '';
  showError: boolean = false;

  email: string = '';
  password: string = '';

  alert: Alert | undefined;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: AppToastService,
    private userService: UserService
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }

  async ngOnInit(): Promise<void> {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    if (await this.authService.isUserAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  validateControl = (controlName: string) => {
    const control = this.loginForm.get(controlName);
    return control?.invalid && control?.touched;
  };

  hasError = (controlName: string, errorName: string) => {
    const control = this.loginForm.get(controlName);
    return control?.hasError(errorName);
  };

  close() {
    this.alert = undefined;
  }

  loginUser = (loginFormValue: { email: string; password: string }) => {
    this.showError = false;
    const login = { ...loginFormValue };

    const userForAuth: UserForAuthenticationDto = {
      email: login.email,
      password: login.password,
    };

    this.authService.loginUser(userForAuth).subscribe({
      next: (res: AuthResponseDto) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('refreshtoken', res.refreshToken);
        this.authService.sendAuthStateChangeNotification(res.isAuthSuccessful);
        this.router.navigate([this.returnUrl]);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.message;

        const alert: Alert = {
          type: 'danger',
          message: err.message,
        };

        this.alert = alert;

        this.showError = true;
      },
    });
  };

  reactivate(): void {
    const input: EmailInputDto = {
      Email: this.loginForm.get('email')?.value,
    };
    this.userService.enableAccount(input).subscribe({
      next: () => {
        this.loginUser(this.loginForm.value);
      },
      error: () => {
        this.toastService.show('Error', 'Something went wrong.');
      },
    });
  }
}
