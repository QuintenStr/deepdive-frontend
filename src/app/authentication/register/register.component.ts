import { Component, OnInit, TemplateRef } from '@angular/core';
import { AuthenticationService } from '../../shared/service/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { AzureBlobStorageService } from '../../shared/service/azureblobstorage.service';
import { UserForRegistrationDto } from '../../shared/interface/request/userforregistrationdto.model';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthResponseDto } from '../../shared/interface/response/authresponsedto.model';
import {
  NgbDateStruct,
  NgbCalendar,
  NgbDate,
} from '@ng-bootstrap/ng-bootstrap';
import { Alert } from '../../shared/interface/alert.model';
import { RegistrationDocumentTypes } from '../../shared/enum/registrationdocument.types.enum';
import { UserService } from '../../shared/service/user.service';
import { UploadRegisterDocumentDto } from '../../shared/interface/request/uploadregisterdocumentdto.model';
import { DayTemplateContext } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker-day-template-context';
import { LoadingService } from '../../shared/service/loading.service';

interface UploadProgresses {
  [key: string]: number;
}

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  public RegistrationDocumentTypes = RegistrationDocumentTypes;

  private returnUrl!: string;
  registerForm: FormGroup;
  errorMessage: string = '';
  showError: boolean = false;
  alert: Alert | undefined;
  selectedFile: File | undefined;

  selectedDate!: NgbDateStruct;
  minDate: NgbDateStruct;
  maxDate: NgbDateStruct;
  customDay!: TemplateRef<DayTemplateContext>;

  documentTypes: RegistrationDocumentTypes[] = [
    RegistrationDocumentTypes.IdPassport,
    RegistrationDocumentTypes.Certificate,
  ];

  initializeUploadProgresses(): UploadProgresses {
    const progresses: UploadProgresses = {};
    Object.keys(RegistrationDocumentTypes)
      .filter(key => isNaN(Number(key)))
      .forEach(key => {
        progresses[key] = 0;
      });
    return progresses;
  }

  public uploadProgresses: UploadProgresses = this.initializeUploadProgresses();

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private blobService: AzureBlobStorageService,
    private calendar: NgbCalendar,
    private userService: UserService,
    private loadingService: LoadingService
  ) {
    const maxDateToday = this.calendar.getToday();

    this.selectedDate = maxDateToday;
    this.maxDate = maxDateToday;
    this.minDate = { year: 1850, month: 1, day: 1 };

    this.registerForm = new FormGroup(
      {
        firstName: new FormControl('', [Validators.required]),
        lastName: new FormControl('', [Validators.required]),
        userName: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required, Validators.email]),
        emailConfirmation: new FormControl('', [
          Validators.required,
          Validators.email,
        ]),
        password: new FormControl('', [Validators.required]),
        passwordConfirmation: new FormControl('', [Validators.required]),
        phoneNumber: new FormControl('', [Validators.required]),
        documents: new FormGroup({}),
        birthDate: new FormControl(this.selectedDate, [Validators.required]),
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
          this.fileNotNull,
          this.fileTypeValidator([
            'application/pdf',
            'image/jpeg',
            'image/png',
          ]),
        ])
      );
    });
  }

  async ngOnInit(): Promise<void> {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    if (await this.authService.isUserAuthenticated()) {
      this.router.navigate([this.returnUrl]);
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
    this.alert = undefined;
  }

  registerUser = (registerFormValue: {
    firstName: string;
    lastName: string;
    userName: string;
    phoneNumber: string;
    email: string;
    emailConfirmation: string;
    password: string;
    passwordConfirmation: string;
    birthDate: NgbDate;
  }) => {
    this.showError = false;
    this.errorMessage = '';

    const formValues = { ...registerFormValue };

    const formattedDateString = `${registerFormValue.birthDate.year
      .toString()
      .padStart(4, '0')}-${registerFormValue.birthDate.month
      .toString()
      .padStart(2, '0')}-${registerFormValue.birthDate.day
      .toString()
      .padStart(2, '0')}`;

    const user: UserForRegistrationDto = {
      userName: formValues.userName,
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      email: formValues.email,
      emailConfirmation: formValues.emailConfirmation,
      password: formValues.password,
      passwordConfirmation: formValues.passwordConfirmation,
      phoneNumber: formValues.phoneNumber,
      birthDate: formattedDateString,
    };

    this.authService.registerUser(user).subscribe({
      next: async (response: AuthResponseDto) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshtoken', response.refreshToken);

        await this.uploadDocuments();

        this.authService.sendAuthStateChangeNotification(
          response.isAuthSuccessful
        );
        this.loadingService.hide();
        this.router.navigate(['/home']);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.message;
        this.showError = true;
      },
    });
  };

  uploadDocuments(): Promise<void[]> {
    const documentsControl = this.registerForm.get('documents') as FormGroup;
    const uploadPromises: Promise<void>[] = [];

    Object.keys(documentsControl.controls).forEach((documentType: string) => {
      const fileControl = documentsControl.get(documentType) as FormControl;
      const file: File | undefined = fileControl.value;
      if (file) {
        const uniqueName = this.generateUUID();
        const userId = this.authService.getId();
        const uploadDocu: UploadRegisterDocumentDto = {
          Id: uniqueName,
          DocumentName: file.name,
          UserIdFK: userId,
          DocumentType:
            RegistrationDocumentTypes[
              documentType as keyof typeof RegistrationDocumentTypes
            ],
          CreatedOn: new Date().toISOString(),
        };

        const uploadPromise = new Promise<void>((resolve, reject) => {
          this.userService.uploadUserRegisterDocument(uploadDocu).subscribe({
            next: () => {
              this.loadingService.show();

              this.blobService.uploadFileWithProgress(
                file,
                'registerdocuments',
                uniqueName,
                (progress: number) =>
                  (this.uploadProgresses[documentType] = progress),
                () => {
                  resolve();
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (error: any) => {
                  console.error(`${documentType} upload error:`, error);
                  reject(error);
                }
              );
            },
            error: (err: HttpErrorResponse) => {
              this.errorMessage = err.message;
              this.showError = true;
              reject(err);
            },
          });
        });

        uploadPromises.push(uploadPromise);
      }
    });

    return Promise.all(uploadPromises);
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

  fileNotNull: ValidatorFn = (
    control: AbstractControl
  ): { [key: string]: boolean } | null => {
    const file = control.value;
    if (file === undefined || file === null) {
      return { nullFile: true };
    }
    return null;
  };

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
