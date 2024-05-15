import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ExcursionsListDto } from '../interface/response/excursionslistdto.model';
import { EndpointService } from './endpoint.service';
import { ExcursionDetailInfo } from '../interface/response/excursiondetaildto.model';
import { IdInputDto } from '../interface/request/viewapplicationidinputdto.model';
import { AddExcursion } from '../interface/request/excursionadddto.model';
import { UpdateExcursionRequestDto } from '../interface/request/updateexcursionrequestdto.model';
import { ExcursionParticipantDto } from '../interface/request/excursionparticipantdto.model';
import { ExcursionMultipleParticipantsDto } from '../interface/request/excursionmultipleparticipantsdto.model';
import { IdOutputDto } from '../interface/response/idoutputdto.model';

@Injectable({
  providedIn: 'root',
})
export class ExcursionsService {
  constructor(private http: HttpClient, private envUrl: EndpointService) {}

  public getListExcursions = () => {
    return this.http.get<ExcursionsListDto[]>(this.envUrl.excursionsList, {
      headers: { 'Show-Loading': 'true' },
    });
  };

  public GetExcursionById = (body: IdInputDto) => {
    return this.http.post<ExcursionDetailInfo>(
      this.envUrl.excursionDetailsById,
      body,
      {
        headers: { 'Show-Loading': 'true' },
      }
    );
  };

  public AddExcursion = (body: AddExcursion) => {
    return this.http.post<IdOutputDto>(this.envUrl.addExcursion, body, {
      headers: { 'Show-Loading': 'true' },
    });
  };

  public DeleteExcursion = (body: IdInputDto) => {
    return this.http.request<unknown>('delete', this.envUrl.deleteExcursion, {
      body: body,
      headers: { 'Show-Loading': 'true' },
    });
  };

  public UpdateExcursion = (body: UpdateExcursionRequestDto) => {
    return this.http.patch<unknown>(this.envUrl.updateExcursion, body, {
      headers: { 'Show-Loading': 'true' },
    });
  };

  public AddExcursionParticipant = (body: ExcursionParticipantDto) => {
    return this.http.put<unknown>(this.envUrl.addExcursionParticipant, body, {
      headers: { 'Show-Loading': 'true' },
    });
  };

  public AddMultipleExcursionParticipant = (
    body: ExcursionMultipleParticipantsDto
  ) => {
    return this.http.put<unknown>(
      this.envUrl.addMultipleExcursionParticipant,
      body,
      {
        headers: { 'Show-Loading': 'true' },
      }
    );
  };

  public RemoveExcursionParticipant = (body: ExcursionParticipantDto) => {
    return this.http.request<unknown>(
      'delete',
      this.envUrl.removeExcursionParticipant,
      {
        body: body,
        headers: { 'Show-Loading': 'true' },
      }
    );
  };
}
