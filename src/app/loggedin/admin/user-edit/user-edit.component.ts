import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../shared/service/user.service';
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { AppToastService } from '../../../shared/service/toast.service';
import { UsersForListSafe } from '../../../shared/interface/response/safeuserlistdto.model';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { UpdateUserInputDto } from '../../../shared/interface/request/updateuserinputdto.model';
import { Alert } from '../../../shared/interface/alert.model';
import { Router } from '@angular/router';

interface registerFormValue {
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  birthdate: NgbDate;
}

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
})
export class UserEditComponent implements OnInit {
  userId: string = '';
  editinfoForm: FormGroup;
  User!: UsersForListSafe;
  newPassword: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  showError: boolean = false;
  alert: Alert | undefined;
  alertStatus: Alert | undefined;

  constructor(
    private activeRouter: ActivatedRoute,
    private userService: UserService,
    private toastService: AppToastService,
    protected router: Router
  ) {
    this.editinfoForm = new FormGroup(
      {
        firstName: new FormControl('', [Validators.required]),
        lastName: new FormControl('', [Validators.required]),
        username: new FormControl('', [Validators.required]),
        birthdate: new FormControl('', [Validators.required]),
        phoneNumber: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl(''),
        passwordConfirmation: new FormControl(''),
      },
      {
        validators: [this.passwordConfirmationValidator],
      }
    );
  }

  ngOnInit() {
    this.loadData();
  }

  close() {
    this.alertStatus = undefined;
  }

  loadData(): void {
    this.userId = this.activeRouter.snapshot.paramMap.get('id')!;
    this.userService.getUserFromId(this.userId).subscribe({
      next: (response: UsersForListSafe) => {
        this.User = response;
        this.populateForm();
      },
      error: () => {
        this.router.navigate(['/admin/users']);
        this.toastService.show(
          'Error',
          'Something went wrong loading the data.'
        );
      },
    });
  }

  validateControl = (controlName: string) => {
    const control = this.editinfoForm.get(controlName);
    return control?.invalid && control?.touched;
  };

  hasError = (controlName: string, errorName: string) => {
    const control = this.editinfoForm.get(controlName);
    return control?.hasError(errorName);
  };

  populateForm(): void {
    const dateSplit = this.User.birthdate.split('-');

    const dateStruct: NgbDateStruct = {
      year: Number(dateSplit[0]),
      month: Number(dateSplit[1]),
      day: Number(dateSplit[2]),
    };

    this.editinfoForm.patchValue({
      firstName: this.User.firstName,
      lastName: this.User.lastName,
      username: this.User.username,
      email: this.User.email,
      phoneNumber: this.User.phoneNumber,
      birthdate: dateStruct,
    });
  }

  async updateUser(registerFormValue: registerFormValue): Promise<void> {
    try {
      await this.updateUser1(registerFormValue);
      this.toastService.show('Sucess', 'Changes saved!');
      this.router.navigate(['/admin/users']);
    } catch (err: unknown) {
      if (err instanceof HttpErrorResponse) {
        this.handleError(err);
      } else {
        // Handle other types of errors or rethrow the error
        throw err;
      }
    }
  }

  handleError(err: HttpErrorResponse): void {
    this.errorMessage = err.message;

    const alert: Alert = {
      type: 'danger',
      message: err.message,
    };

    this.alert = alert;
    this.showError = true;
  }

  updateUser1(registerFormValue: registerFormValue): Promise<void> {
    const formattedDateString = `${registerFormValue.birthdate.year
      .toString()
      .padStart(4, '0')}-${registerFormValue.birthdate.month
      .toString()
      .padStart(2, '0')}-${registerFormValue.birthdate.day
      .toString()
      .padStart(2, '0')}`;

    const updateUser: UpdateUserInputDto = {
      Id: this.userId,
      FirstName: registerFormValue.firstName,
      LastName: registerFormValue.lastName,
      BirthDate: formattedDateString,
      UserName: registerFormValue.username,
      Email: registerFormValue.email,
      Password: registerFormValue.passwordConfirmation,
      PhoneNumber: registerFormValue.phoneNumber,
    };

    return new Promise<void>((resolve, reject) => {
      this.userService.updateUser(updateUser).subscribe({
        next: async () => {
          resolve();
        },
        error: (err: HttpErrorResponse) => {
          reject(err);
        },
      });
    });
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
