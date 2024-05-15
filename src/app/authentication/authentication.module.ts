import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { RegisterCompleteComponent } from './register-complete/register-complete.component';
import { ViewApplicationComponent } from './view-application/view-application.component';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { EmailConfirmedComponent } from './email-confirmed/email-confirmed.component';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { CompletePwdresetComponent } from './complete-pwdreset/complete-pwdreset.component';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../app.module';
import { SettingsPopupComponent } from './settings-popup/settings-popup.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    RegisterCompleteComponent,
    ViewApplicationComponent,
    EmailConfirmedComponent,
    ConfirmEmailComponent,
    CompletePwdresetComponent,
    SettingsPopupComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbAlertModule,
    RouterModule,
    NgbDatepickerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    FormsModule,
  ],
})
export class AuthenticationModule {}
