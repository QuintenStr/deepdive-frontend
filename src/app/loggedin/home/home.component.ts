import { Component, OnInit } from '@angular/core';
import { HomeService } from '../../shared/service/home.service';
import { AuthenticationService } from '../../shared/service/authentication.service';
import { IdInputDto } from '../../shared/interface/request/viewapplicationidinputdto.model';
import { HomeDashboardDto } from '../../shared/interface/response/homedashboarddto.model';
import { AppToastService } from '../../shared/service/toast.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  constructor(
    private homeService: HomeService,
    private authService: AuthenticationService,
    private toastService: AppToastService
  ) {}

  protected dashboardinfo!: HomeDashboardDto;
  protected baseUrl =
    'https://storagedeepdiveapp.blob.core.windows.net/excursions/';

  ngOnInit(): void {
    const id: IdInputDto = {
      Id: this.authService.getId(),
    };

    this.homeService.GetDashboardInfo(id).subscribe({
      next: (response: HomeDashboardDto) => {
        this.dashboardinfo = response;
      },
      error: () => {
        this.toastService.show(
          'Error',
          'Something went wrong loading the data.'
        );
      },
    });
  }
}
