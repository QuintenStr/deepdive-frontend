import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  HttpClientModule,
  HTTP_INTERCEPTORS,
  withFetch,
  provideHttpClient,
  HttpClient,
} from '@angular/common/http';
import { ErrorHandlerService } from './shared/service/error-handler.service';
import { JwtModule } from '@auth0/angular-jwt';

import { AuthenticationModule } from './authentication/authentication.module';
import { NotFoundComponent } from './notfound/notfound.component';

import { NgbDateParserFormatter, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoadingService } from './shared/service/loading.service';
import { LoadingInterceptor } from './shared/service/loading.interceptor';
import { LoaderComponent } from './shared/component/loader/loader.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { NavbarComponent } from './shared/component/navbar/navbar.component';
import { LoggedinComponent } from './loggedin/loggedin.component';
import { AuthTokenInterceptor } from './shared/service/authtoken.interceptor';
import { ToastsComponent } from './shared/component/toasts/toasts.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
import { FormsModule } from '@angular/forms';
import { ExcursionsModule } from './loggedin/excursions/excursions.module';
import { AdminModule } from './loggedin/admin/admin.module';
import { NgbDateCustomParserFormatter } from './shared/service/ngb-date-custom-parser-formatter.service';
import { SettingsComponent } from './loggedin/settings/settings.component';
import { FooterComponent } from './shared/component/footer/footer.component';
import { HomeModule } from './loggedin/home/home.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function tokenGetter() {
  return localStorage.getItem('token');
}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/');
}

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    LoaderComponent,
    ForbiddenComponent,
    NavbarComponent,
    ForgotPasswordComponent,
    LoggedinComponent,
    ToastsComponent,
    SettingsComponent,
    FooterComponent,
  ],
  providers: [
    LoadingService,
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorHandlerService,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthTokenInterceptor,
      multi: true,
    },
    provideHttpClient(withFetch()),
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AuthenticationModule,
    BrowserAnimationsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: [],
        disallowedRoutes: [],
      },
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    ExcursionsModule,
    AdminModule,
    HomeModule,
  ],
})
export class AppModule {}
