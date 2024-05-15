import { Component, OnInit, TemplateRef } from '@angular/core';
import { AuthenticationService } from '../../shared/service/authentication.service';
import { Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { AzureBlobStorageService } from '../../shared/service/azureblobstorage.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthResponseDto } from '../../shared/interface/response/authresponsedto.model';
import { UserService } from '../../shared/service/user.service';
import { ViewApplicationDto } from '../../shared/interface/response/viewapplicationresponsedto.model';
import { UserDocument } from '../../shared/interface/userdocument.model';
import {
  NgbDateStruct,
  NgbCalendar,
  NgbDate,
} from '@ng-bootstrap/ng-bootstrap';
import { RequestStatus } from '../../shared/enum/request.status.enum';
import { DocuIdInput } from '../../shared/interface/request/removedocumentbyname.model';
import { UserForAuthenticationDto } from '../../shared/interface/request/userforauthenticationdto.model';
import { RegistrationDocumentTypes } from '../../shared/enum/registrationdocument.types.enum';
import { UploadRegisterDocumentDto } from '../../shared/interface/request/uploadregisterdocumentdto.model';
import { IdInputDto } from '../../shared/interface/request/viewapplicationidinputdto.model';
import { UpdateUserInputDto } from '../../shared/interface/request/updateuserinputdto.model';
import { AppToastService } from '../../shared/service/toast.service';
import { TokenRefreshDto } from '../../shared/interface/request/tokenrefreshdto.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { DayTemplateContext } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker-day-template-context';

interface registerFormValue {
  firstName: string;
  lastName: string;
  userName: string;
  phoneNumber: string;
  email: string;
  emailConfirmation: string;
  password: string;
  passwordConfirmation: string;
  oldPassword: string;
  document: File;
  birthDate: NgbDate;
}

interface Alert {
  type: string;
  message: string;
  adminComment: string | null | undefined;
}

@Component({
  selector: 'app-view-application',
  templateUrl: './view-application.component.html',
  styleUrl: './view-application.component.scss',
})
export class ViewApplicationComponent implements OnInit {
  public RegistrationDocumentTypes = RegistrationDocumentTypes;
  requestStatus = RequestStatus;
  private returnUrl!: string;
  registerForm: FormGroup;
  errorMessage: string = '';
  showError: boolean = false;
  alert: Alert | undefined;
  alertStatus: Alert | undefined;
  selectedIdPassportFile: File | undefined;

  isEditing: boolean = false;
  userData!: ViewApplicationDto;

  deletedDocuments: UserDocument[] = [];

  selectedDate!: NgbDateStruct;
  minDate: NgbDateStruct;
  maxDate: NgbDateStruct;
  customDay!: TemplateRef<DayTemplateContext>;

  documentTypes: RegistrationDocumentTypes[] = [
    RegistrationDocumentTypes.IdPassport,
    RegistrationDocumentTypes.Certificate,
  ];

  constructor(
    protected authService: AuthenticationService,
    private blobService: AzureBlobStorageService,
    private userService: UserService,
    private calendar: NgbCalendar,
    private toastService: AppToastService,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) {
    const maxDate = this.calendar.getToday();

    this.selectedDate = maxDate;
    this.maxDate = maxDate;
    this.minDate = { year: 1850, month: 1, day: 1 };
    this.registerForm = new FormGroup(
      {
        firstName: new FormControl({ value: '', disabled: !this.isEditing }, [
          Validators.required,
        ]),
        lastName: new FormControl({ value: '', disabled: !this.isEditing }, [
          Validators.required,
        ]),
        userName: new FormControl({ value: '', disabled: !this.isEditing }, [
          Validators.required,
        ]),
        email: new FormControl({ value: '', disabled: !this.isEditing }, [
          Validators.required,
          Validators.email,
        ]),
        emailConfirmation: new FormControl(
          { value: '', disabled: !this.isEditing },
          [Validators.required, Validators.email]
        ),
        password: new FormControl({ value: '', disabled: !this.isEditing }, []),
        passwordConfirmation: new FormControl(
          { value: '', disabled: !this.isEditing },
          []
        ),
        oldPassword: new FormControl({ value: '', disabled: !this.isEditing }, [
          Validators.required,
        ]),
        phoneNumber: new FormControl({ value: '', disabled: !this.isEditing }, [
          Validators.required,
        ]),
        documents: new FormGroup({}),
        birthDate: new FormControl(
          { value: this.selectedDate, disabled: !this.isEditing },
          [Validators.required]
        ),
      },
      {
        validators: [
          this.emailConfirmationValidator,
          this.passwordConfirmationValidator,
        ],
      }
    );

    this.documentTypes.forEach(documentType => {
      (this.registerForm.get('documents') as FormGroup).addControl(
        RegistrationDocumentTypes[documentType],
        new FormControl(undefined, [
          this.fileTypeValidator([
            'application/pdf',
            'image/jpeg',
            'image/png',
          ]),
        ])
      );
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const idfromtoken = this.authService.getId();
    if (idfromtoken == '') {
      this.router.navigate(['/forbidden']);
    } else {
      const idInput: IdInputDto = {
        Id: idfromtoken,
      };

      this.userService.getUserData(idInput).subscribe({
        next: (response: ViewApplicationDto) => {
          this.userData = response;
          this.populateForm();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = err.message;
          this.showError = true;
        },
      });
    }
  }

  updateFormControls(): void {
    const formControls = this.registerForm.controls;

    for (const controlName in formControls) {
      if (Object.prototype.hasOwnProperty.call(formControls, controlName)) {
        const control = formControls[controlName];
        control.disabled ? control.enable() : control.disable();
      }
    }
  }

  canEdit(): boolean {
    const requestStatus = this.userData.status;
    return (
      requestStatus !== RequestStatus.Approved &&
      requestStatus !== RequestStatus.Denied
    );
  }

  toggleEdit(): void {
    if (this.canEdit()) {
      this.isEditing = !this.isEditing;
      this.updateFormControls();
    } else {
      this.toastService.show(
        'Oops',
        'Editting is not allowed for this application.'
      );
    }
  }

  cancelEdit() {
    this.errorMessage = '';
    this.showError = false;
    this.registerForm.get('oldPassword')?.setValue(null);
    this.registerForm.get('oldPassword')?.markAsUntouched();

    this.loadData();
    this.toggleEdit();
  }

  protected currentStatus!: RequestStatus;

  populateForm(): void {
    const dateSplit = this.userData.birthDate.split('T')[0].split('-');
    const dateStruct: NgbDateStruct = {
      year: Number(dateSplit[0]),
      month: Number(dateSplit[1]),
      day: Number(dateSplit[2]),
    };

    this.registerForm.patchValue({
      firstName: this.userData.firstName,
      lastName: this.userData.lastName,
      userName: this.userData.userName,
      email: this.userData.email,
      emailConfirmation: this.userData.email,
      phoneNumber: this.userData.phoneNumber,
      birthDate: dateStruct,
    });

    if (this.userData.status == RequestStatus.Requested) {
      const alertStatus: Alert = {
        type: 'primary',
        message: 'registerviewapplicationstatusrequested',
        adminComment: null,
      };
      this.alertStatus = alertStatus;
    }
    if (this.userData.status == RequestStatus.WaitingForUserChanges) {
      const alertStatus: Alert = {
        type: 'info',
        message: 'registerviewapplicationstatuswaitingforchanges',
        adminComment: this.userData.adminComment,
      };
      this.alertStatus = alertStatus;
    }
    if (this.userData.status == RequestStatus.Approved) {
      const alertStatus: Alert = {
        type: 'success',
        message: `registerviewapplicationstatusapproved`,
        adminComment: null,
      };
      this.alertStatus = alertStatus;
    }
    if (this.userData.status == RequestStatus.Denied) {
      const alertStatus: Alert = {
        type: 'danger',
        message: `registerviewapplicationstatusdenied`,
        adminComment: null,
      };
      this.alertStatus = alertStatus;
    }
  }

  validateControl = (controlName: string) => {
    const control = this.registerForm.get(controlName);
    return control?.invalid && control?.touched;
  };

  hasError = (controlName: string, errorName: string) => {
    const control = this.registerForm.get(controlName);
    return control?.hasError(errorName);
  };

  close() {
    this.alertStatus = undefined;
  }

  viewDocument(docu: UserDocument): void {
    this.blobService.downloadFile(docu.id, 'registerdocuments', blob => {
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    });
  }

  deleteDocument(docu: UserDocument) {
    if (confirm('Are you sure to delete ' + docu.documentName)) {
      const index = this.userData.documentsInfo.indexOf(docu);
      if (index !== -1) {
        this.userData.documentsInfo.splice(index, 1);
        this.deletedDocuments.push(docu);
      }
    }
  }

  saveChanges = async (registerFormValue: registerFormValue) => {
    try {
      await this.validatePassword(registerFormValue.oldPassword);
      await this.updateUser(registerFormValue);
      await this.deleteSelectedBlobs();
      await this.uploadDocuments();
      await this.setRequestStatus();

      this.toastService.show('Sucess', 'Changes saved!');
      const documentsControl = this.registerForm.get('documents');
      if (documentsControl instanceof FormGroup) {
        Object.keys(documentsControl.controls).forEach(
          (documentType: string) => {
            const specificDocumentControl = documentsControl.get(documentType);
            if (specificDocumentControl instanceof FormControl) {
              specificDocumentControl.setValue(null);
            }
          }
        );
      }

      this.cancelEdit();
    } catch (err: unknown) {
      if (err instanceof HttpErrorResponse) {
        this.handleError(err);
      } else {
        // Handle other types of errors or rethrow the error
        throw err;
      }
    }
  };

  validatePassword(oldPassword: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const userForPasswordValidation: UserForAuthenticationDto = {
        email: this.authService.getEmail(),
        password: oldPassword,
      };

      this.authService.validatePassword(userForPasswordValidation).subscribe({
        next: () => {
          resolve();
        },
        error: (err: HttpErrorResponse) => {
          reject(err);
        },
      });
    });
  }

  updateUser(registerFormValue: registerFormValue): Promise<void> {
    const formattedDateString = `${registerFormValue.birthDate.year
      .toString()
      .padStart(4, '0')}-${registerFormValue.birthDate.month
      .toString()
      .padStart(2, '0')}-${registerFormValue.birthDate.day
      .toString()
      .padStart(2, '0')}`;

    const updateUser: UpdateUserInputDto = {
      Id: this.authService.getId(),
      FirstName: registerFormValue.firstName,
      LastName: registerFormValue.lastName,
      BirthDate: formattedDateString,
      UserName: registerFormValue.userName,
      Email: registerFormValue.email,
      Password: registerFormValue.passwordConfirmation,
      PhoneNumber: registerFormValue.phoneNumber,
    };

    return new Promise<void>((resolve, reject) => {
      this.userService.updateUser(updateUser).subscribe({
        next: async () => {
          try {
            // Simulate the asynchronous refreshToken call with a promise
            await new Promise((resolveRefresh, rejectRefresh) => {
              this.authService
                .refreshToken({
                  AccessToken: this.authService.getToken(),
                  RefreshToken: this.authService.getRefreshToken(),
                })
                .subscribe({
                  next: (refreshResult: AuthResponseDto) => {
                    // Set localStorage items from the refreshResponse
                    localStorage.setItem('token', refreshResult.token);
                    localStorage.setItem(
                      'refreshtoken',
                      refreshResult.refreshToken
                    );

                    resolveRefresh(refreshResult);
                  },
                  error: (refreshError: HttpErrorResponse) => {
                    rejectRefresh(refreshError);
                  },
                });
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        error: (err: HttpErrorResponse) => {
          reject(err);
        },
      });
    });
  }

  deleteSelectedBlobs(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.deletedDocuments.length > 0) {
        const deletePromises: Promise<void>[] = [];

        this.deletedDocuments.forEach(docu => {
          const docuId: DocuIdInput = {
            DocumentId: docu.id,
          };

          const deletePromise = new Promise<void>(
            (innerResolve, innerReject) => {
              this.userService.deleteUserRegisterDocument(docuId).subscribe({
                next: () => {
                  this.blobService.deleteFile(
                    docu.id,
                    'registerdocuments',
                    innerResolve
                  );
                },
                error: (err: HttpErrorResponse) => {
                  innerReject(err);
                },
              });
            }
          );

          deletePromises.push(deletePromise);
        });

        Promise.all(deletePromises)
          .then(() => {
            this.deletedDocuments = [];
            resolve();
          })
          .catch(err => reject(err));
      } else {
        resolve();
      }
    });
  }

  uploadDocuments(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const documentsControl = this.registerForm.get('documents');

      if (documentsControl instanceof FormGroup) {
        const uploadPromises: Promise<void>[] = [];

        Object.keys(documentsControl.controls).forEach(
          (documentType: string) => {
            const specificDocumentControl = documentsControl.get(documentType);

            if (specificDocumentControl instanceof FormControl) {
              const selectedFile: File | undefined =
                specificDocumentControl.value;

              if (selectedFile) {
                const uniqueName = this.generateUUID();
                const userId = this.authService.getId();
                const enumMember: RegistrationDocumentTypes =
                  RegistrationDocumentTypes[
                    documentType as keyof typeof RegistrationDocumentTypes
                  ];

                const currentDateTime = new Date();
                const createdOn = currentDateTime.toISOString();

                const uploadDocu: UploadRegisterDocumentDto = {
                  Id: uniqueName,
                  DocumentName: selectedFile.name,
                  UserIdFK: userId,
                  DocumentType: enumMember,
                  CreatedOn: createdOn,
                };

                const uploadPromise = new Promise<void>(
                  (innerResolve, innerReject) => {
                    this.userService
                      .uploadUserRegisterDocument(uploadDocu)
                      .subscribe({
                        next: () => {
                          this.uploadFileToAzureStorage(
                            selectedFile,
                            uniqueName
                          );
                          innerResolve();
                        },
                        error: (err: HttpErrorResponse) => {
                          innerReject(err);
                        },
                      });
                  }
                );

                uploadPromises.push(uploadPromise);
              }
            }
          }
        );

        Promise.all(uploadPromises)
          .then(() => resolve())
          .catch(err => reject(err));
      } else {
        resolve();
      }
    });
  }

  setRequestStatus(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.userService
          .updateRequest({
            UserId: this.authService.getId(),
            Status: RequestStatus.Requested,
          })
          .toPromise();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  goHomeAndRefreshToken(): void {
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
    this.router.navigate(['/home']);
  }

  handleError(err: HttpErrorResponse): void {
    this.errorMessage = err.message;

    const alert: Alert = {
      type: 'danger',
      message: err.message,
      adminComment: null,
    };

    this.alert = alert;
    this.showError = true;
  }

  uploadFileToAzureStorage(selectedFile: File, name: string) {
    this.blobService.uploadFile(
      selectedFile,
      'registerdocuments',
      name,
      () => {}
    );
  }

  emailConfirmationValidator: ValidatorFn = (
    control: AbstractControl
  ): { [key: string]: boolean } | null => {
    const email = control.get('email')?.value;
    const emailConfirmation = control.get('emailConfirmation')?.value;

    return email === emailConfirmation
      ? null
      : { emailConfirmationNotMatch: true };
  };

  passwordConfirmationValidator: ValidatorFn = (
    control: AbstractControl
  ): { [key: string]: boolean } | null => {
    const password = control.get('password')?.value;
    const passwordConfirmation = control.get('passwordConfirmation')?.value;

    return password === passwordConfirmation
      ? null
      : { passwordConfirmationNotMatch: true };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFileChange(event: any, documentType: RegistrationDocumentTypes) {
    const selectedFile = event.target.files[0];

    const documentsControl = this.registerForm.get('documents');
    if (documentsControl instanceof FormGroup) {
      const specificDocumentControl = documentsControl.get(
        RegistrationDocumentTypes[documentType]
      );
      if (specificDocumentControl instanceof FormControl) {
        specificDocumentControl.patchValue(selectedFile);
        specificDocumentControl.markAsTouched();
      }
    }
  }

  fileTypeValidator(allowedTypes: string[]): ValidatorFn {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (control: AbstractControl): { [key: string]: any } | null => {
      const file = control.value;

      if (file) {
        return allowedTypes.includes(file.type)
          ? null
          : { invalidFileType: true };
      }

      return null;
    };
  }

  generateUUID(): string {
    const cryptoObj = window.crypto;
    if (!cryptoObj) {
      console.error('Crypto API not supported in this environment.');
      return '';
    }

    const buffer = new Uint8Array(16);
    cryptoObj.getRandomValues(buffer);

    buffer[6] = (buffer[6] & 0x0f) | 0x40;
    buffer[8] = (buffer[8] & 0x3f) | 0x80;

    const hexArray = Array.from(buffer).map(byte =>
      byte.toString(16).padStart(2, '0')
    );

    const uuid = [
      hexArray.slice(0, 4).join(''),
      hexArray.slice(4, 6).join(''),
      hexArray.slice(6, 8).join(''),
      hexArray.slice(8, 10).join(''),
      hexArray.slice(10).join(''),
    ].join('-');

    return uuid;
  }
}
