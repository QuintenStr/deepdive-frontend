import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../shared/service/authentication.service';
import { ValidatePasswordResetDto } from '../../shared/interface/request/validatepasswordresetdto.model';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Alert } from '../../shared/interface/alert.model';
import { AppToastService } from '../../shared/service/toast.service';
import { UpdateUserPasswordDto } from '../../shared/interface/request/updateuserpassworddto.model';

@Component({
  selector: 'app-complete-pwdreset',
  templateUrl: './complete-pwdreset.component.html',
  styleUrls: ['./complete-pwdreset.component.scss'],
  standalone: false,
})
export class CompletePwdresetComponent implements OnInit {
  id!: string;
  token!: string;
  isValid!: boolean;

  resetPasswordForm: FormGroup;
  errorMessage: string = '';
  showError: boolean = false;

  password: string = '';
  passwordConfirmatrion: string = '';

  alert: Alert | undefined;

  constructor(
    private toastService: AppToastService,
    private activeRoute: ActivatedRoute,
    private authService: AuthenticationService,
    private router: Router
  ) {
    this.resetPasswordForm = new FormGroup(
      {
        password: new FormControl('', [Validators.required]),
        passwordConfirmation: new FormControl('', [Validators.required]),
      },
      {
        validators: [this.passwordConfirmationValidator],
      }
    );
  }

  ngOnInit(): void {
    this.loaddata();
  }

  updatePassword = (resetPasswordFormValue: {
    password: string;
    passwordConfirmation: string;
  }) => {
    this.showError = false;
    const passwords = { ...resetPasswordFormValue };

    const input: UpdateUserPasswordDto = {
      Id: this.id,
      Token: this.token,
      Password: passwords.passwordConfirmation,
    };

    this.authService.updatePassword(input).subscribe({
      next: () => {
        this.toastService.show('Success', 'Password changed!');
        this.router.navigate(['/home']);
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

  loaddata(): void {
    this.activeRoute.queryParams.subscribe(params => {
      this.id = params['id'];
      this.token = params['token'];
    });

    const input: ValidatePasswordResetDto = {
      Id: this.id,
      Token: this.token,
    };

    this.authService.validatePasswordReset(input).subscribe({
      next: () => {
        this.isValid = true;
      },
      error: (err: HttpErrorResponse) => {
        this.router.navigate(['/home']);
        this.toastService.show('Error', err.message);
      },
    });
  }

  validateControl = (controlName: string) => {
    const control = this.resetPasswordForm.get(controlName);
    return control?.invalid && control?.touched;
  };

  hasError = (controlName: string, errorName: string) => {
    const control = this.resetPasswordForm.get(controlName);
    return control?.hasError(errorName);
  };

  close() {
    this.alert = undefined;
  }

  passwordConfirmationValidator: ValidatorFn = (
    control: AbstractControl
  ): { [key: string]: boolean } | null => {
    const password = control.get('password')?.value;
    const passwordConfirmation = control.get('passwordConfirmation')?.value;

    return password === passwordConfirmation
      ? null
      : { passwordConfirmationNotMatch: true };
  };
}
