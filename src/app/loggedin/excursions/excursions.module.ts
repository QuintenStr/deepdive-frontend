import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExcursionsListComponent } from './excursions-list/excursions-list.component';
import { ExcursionDetailComponent } from './excursion-detail/excursion-detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxMasonryModule } from 'ngx-masonry';
import { SharedModule } from '../../shared/module/shared.module';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../app.module';

@NgModule({
  declarations: [ExcursionsListComponent, ExcursionDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTypeaheadModule,
    NgxMasonryModule,
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  exports: [ExcursionsListComponent, ExcursionDetailComponent],
})
export class ExcursionsModule {}
