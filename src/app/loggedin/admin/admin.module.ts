import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembershipDemandsComponent } from './membership-demands/membership-demands.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { UsersTableComponent } from './users-table/users-table.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ExcursionAddComponent } from './excursion-add/excursion-add.component';
import { ExcursionEditComponent } from './excursion-edit/excursion-edit.component';
import { DateformatPipe } from '../../shared/pipes/dateformat.pipe';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../app.module';

@NgModule({
  declarations: [
    MembershipDemandsComponent,
    UserEditComponent,
    UsersTableComponent,
    ExcursionAddComponent,
    ExcursionEditComponent,
    DateformatPipe,
  ],
  imports: [
    ReactiveFormsModule,
    NgbModule,
    FormsModule,
    CommonModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  exports: [MembershipDemandsComponent, UserEditComponent, UsersTableComponent],
})
export class AdminModule {}
