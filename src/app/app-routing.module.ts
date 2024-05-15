import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './authentication/login/login.component';
import { RegisterComponent } from './authentication/register/register.component';
import { HomeComponent } from './loggedin/home/home.component';
import { AuthGuard } from './shared/guard/auth.guard';
import { NotFoundComponent } from './notfound/notfound.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { AdminGuard } from './shared/guard/admin.guard';
import { LoggedinComponent } from './loggedin/loggedin.component';
import { CandidateUserGuard } from './shared/guard/candidateuser.guard';
import { RegisterCompleteComponent } from './authentication/register-complete/register-complete.component';
import { ViewApplicationComponent } from './authentication/view-application/view-application.component';
import { ExclusiveCandidateUserGuard } from './shared/guard/exclusive.candidateuser.guard';
import { UsersTableComponent } from './loggedin/admin/users-table/users-table.component';
import { UserEditComponent } from './loggedin/admin/user-edit/user-edit.component';
import { MembershipDemandsComponent } from './loggedin/admin/membership-demands/membership-demands.component';
import { EmailConfirmedComponent } from './authentication/email-confirmed/email-confirmed.component';
import { EmailVerifiedGuard } from './shared/guard/emailverified.guard';
import { ConfirmEmailComponent } from './authentication/confirm-email/confirm-email.component';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
import { CompletePwdresetComponent } from './authentication/complete-pwdreset/complete-pwdreset.component';
import { ExcursionsListComponent } from './loggedin/excursions/excursions-list/excursions-list.component';
import { ExcursionDetailComponent } from './loggedin/excursions/excursion-detail/excursion-detail.component';
import { ExcursionAddComponent } from './loggedin/admin/excursion-add/excursion-add.component';
import { ExcursionEditComponent } from './loggedin/admin/excursion-edit/excursion-edit.component';
import { SettingsComponent } from './loggedin/settings/settings.component';

const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        component: LoginComponent,
        data: { title: 'pagetitle-signin' },
      },
      {
        path: 'register',
        component: RegisterComponent,
        data: { title: 'pagetitle-registration' },
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        data: { title: 'pagetitle-forgotpwd' },
      },
      {
        path: 'complete-pwdreset',
        component: CompletePwdresetComponent,
        data: { title: 'pagetitle-completeforgotpwd' },
      },
      {
        path: 'register-complete',
        component: RegisterCompleteComponent,
        canActivate: [AuthGuard, ExclusiveCandidateUserGuard],
        data: { title: 'pagetitle-registrationcomplete' },
      },
      {
        path: 'view-application',
        component: ViewApplicationComponent,
        canActivate: [AuthGuard, ExclusiveCandidateUserGuard],
        data: { title: 'pagetitle-viewapplication' },
      },
      {
        path: 'confirm-email/:email',
        component: ConfirmEmailComponent,
        canActivate: [AuthGuard],
        data: { title: 'pagetitle-emailconfirmation' },
      },
      {
        path: 'email-confirmed',
        component: EmailConfirmedComponent,
        canActivate: [AuthGuard],
        data: { title: 'pagetitle-emailconfirmationcomplete' },
      },
    ],
  },
  {
    path: '',
    component: LoggedinComponent,
    canActivate: [AuthGuard, CandidateUserGuard, EmailVerifiedGuard],
    children: [
      {
        path: 'admin',
        canActivate: [AuthGuard, AdminGuard],
        children: [
          { path: '', redirectTo: 'users', pathMatch: 'full' },
          {
            path: 'view-applications',
            component: MembershipDemandsComponent,
            canActivate: [AuthGuard, AdminGuard],
            data: { title: 'pagetitle-admin-viewapplications' },
          },
          {
            path: 'users',
            component: UsersTableComponent,
            canActivate: [AuthGuard, AdminGuard],
            data: { title: 'pagetitle-admin-users' },
          },
          {
            path: 'users/edit/:id',
            component: UserEditComponent,
            canActivate: [AuthGuard, AdminGuard],
            data: { title: 'pagetitle-admin-edituser' },
          },
          {
            path: 'excursion-add',
            component: ExcursionAddComponent,
            canActivate: [AuthGuard, AdminGuard],
            data: { title: 'pagetitle-admin-newexcursion' },
          },
          {
            path: 'excursion-edit/:id',
            component: ExcursionEditComponent,
            canActivate: [AuthGuard, AdminGuard],
            data: { title: 'pagetitle-admin-editexcursion' },
          },
        ],
      },
      {
        path: 'excursions',
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            redirectTo: 'list',
            pathMatch: 'full',
          },
          {
            path: 'list',
            component: ExcursionsListComponent,
            canActivate: [AuthGuard],
            data: { title: 'pagetitle-excursions' },
          },
          {
            path: 'details/:id',
            component: ExcursionDetailComponent,
            canActivate: [AuthGuard],
            data: { title: 'pagetitle-excursiondetails' },
          },
        ],
      },
      {
        path: 'home',
        component: HomeComponent,
        canActivate: [AuthGuard],
        data: { title: 'pagetitle-home' },
      },
      {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [AuthGuard],
        data: { title: 'pagetitle-settings' },
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  {
    path: '404',
    component: NotFoundComponent,
    data: { title: 'pagetitle-notfound' },
  },
  {
    path: 'forbidden',
    component: ForbiddenComponent,
    data: { title: 'pagetitle-unauthorized' },
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/404', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
