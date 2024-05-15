import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../shared/service/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EmailVerification } from '../../shared/interface/request/emailverificationinputdto.model';
import { UserService } from '../../shared/service/user.service';
import { AppToastService } from '../../shared/service/toast.service';
import { Alert } from '../../shared/interface/alert.model';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent implements OnInit {
  private returnUrl!: string;

  forgotPasswordForm: FormGroup;
  errorMessage: string = '';
  showError: boolean = false;
  email: string = '';
  alert: Alert | undefined;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private toastService: AppToastService
  ) {
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  async ngOnInit(): Promise<void> {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    if (await this.authService.isUserAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  validateControl = (controlName: string) => {
    const control = this.forgotPasswordForm.get(controlName);
    return control?.invalid && control?.touched;
  };

  hasError = (controlName: string, errorName: string) => {
    const control = this.forgotPasswordForm.get(controlName);
    return control?.hasError(errorName);
  };

  close() {
    this.alert = undefined;
  }

  sendResetEmail = (email: string) => {
    const emailInput: EmailVerification = {
      Email: email,
    };
    this.userService.sendPasswordResquest(emailInput).subscribe({
      next: () => {
        this.toastService.show(
          'Succes',
          'If your email exists in our app, a email has been sent to reset your password!'
        );
      },
      error: () => {
        this.toastService.show('Oepsie', 'Something went wrong!');
      },
    });
  };
}
