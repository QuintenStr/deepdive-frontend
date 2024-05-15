import { HttpClient } from '@angular/common/http';
import { IdInputDto } from '../interface/request/viewapplicationidinputdto.model';
import { HomeDashboardDto } from '../interface/response/homedashboarddto.model';
import { Injectable } from '@angular/core';
import { EndpointService } from './endpoint.service';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  constructor(private http: HttpClient, private envUrl: EndpointService) {}

  public GetDashboardInfo = (body: IdInputDto) => {
    return this.http.post<HomeDashboardDto>(this.envUrl.homeDashboard, body, {
      headers: { 'Show-Loading': 'true' },
    });
  };
}
