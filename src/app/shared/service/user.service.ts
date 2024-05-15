import { Injectable } from '@angular/core';
import { EndpointService } from './endpoint.service';
import { HttpClient } from '@angular/common/http';
import { ViewApplicationDto } from '../interface/response/viewapplicationresponsedto.model';
import { DocuIdInput } from '../interface/request/removedocumentbyname.model';
import { UploadRegisterDocumentDto } from '../interface/request/uploadregisterdocumentdto.model';
import { IdInputDto } from '../interface/request/viewapplicationidinputdto.model';
import { UpdateUserInputDto } from '../interface/request/updateuserinputdto.model';
import { UpdateStatusRegistrationRequestDto } from '../interface/request/updatestatusregistrationrequestdto.model';
import { UsersForListSafe } from '../interface/response/safeuserlistdto.model';
import { UpdateRegistrationRequestDto } from '../interface/request/updateregistrationrequestdto.model';
import { EmailVerification } from '../interface/request/emailverificationinputdto.model';
import { StringInputDto } from '../interface/request/stringinputdto.model';
import { UsersTypeahead } from '../interface/response/userstypeaheaddto.model';
import { EmailInputDto } from '../interface/request/emailinputdto.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private envUrl: EndpointService, private http: HttpClient) {}

  public getUsers = () => {
    return this.http.get<UsersForListSafe[]>(this.envUrl.allSafeUsers, {
      headers: { 'Show-Loading': 'true' },
    });
  };

  public getUserFromId = (id: string) => {
    return this.http.get<UsersForListSafe>(`${this.envUrl.userFromId}/${id}`, {
      headers: { 'Show-Loading': 'true' },
    });
  };

  public getUserData = (body: IdInputDto) => {
    return this.http.post<ViewApplicationDto>(
      this.envUrl.userViewApplication,
      body,
      { headers: { 'Show-Loading': 'true' } }
    );
  };

  public getAllApplicationsRequestStatus = () => {
    return this.http.get<ViewApplicationDto[]>(
      this.envUrl.allRequestApplications,
      { headers: { 'Show-Loading': 'true' } }
    );
  };

  public deleteUserRegisterDocument = (body: DocuIdInput) => {
    return this.http.request<unknown>(
      'delete',
      this.envUrl.delUserRegisterDocument,
      { body: body, headers: { 'Show-Loading': 'true' } }
    );
  };

  public uploadUserRegisterDocument = (body: UploadRegisterDocumentDto) => {
    return this.http.post<unknown>(this.envUrl.uploadRegisterDocument, body, {
      headers: { 'Show-Loading': 'true' },
    });
  };

  public sendPasswordResquest = (body: EmailVerification) => {
    return this.http.post<unknown>(this.envUrl.sendPasswordrequest, body, {
      headers: { 'Show-Loading': 'true' },
    });
  };

  public updateUser = (body: UpdateUserInputDto) => {
    return this.http.patch<unknown>(this.envUrl.updateUser, body, {
      headers: { 'Show-Loading': 'true' },
    });
  };

  public updateRequest = (body: UpdateStatusRegistrationRequestDto) => {
    return this.http.patch<unknown>(this.envUrl.updateRegisterRequest, body, {
      headers: { 'Show-Loading': 'true' },
    });
  };

  public updateRequestFull = (body: UpdateRegistrationRequestDto) => {
    return this.http.patch<unknown>(
      this.envUrl.updateRegisterRequestFull,
      body,
      {
        headers: { 'Show-Loading': 'true' },
      }
    );
  };

  public getUsersTypeahead = (body: StringInputDto) => {
    return this.http.post<UsersTypeahead[]>(
      this.envUrl.excursionParticipantTypeahead,
      body,
      {
        headers: { 'Show-Loading': 'true' },
      }
    );
  };

  public disableAccount = (body: IdInputDto) => {
    return this.http.post<unknown>(this.envUrl.disableUser, body, {
      headers: { 'Show-Loading': 'true' },
    });
  };

  public enableAccount = (body: EmailInputDto) => {
    return this.http.post<unknown>(this.envUrl.enableUser, body, {
      headers: { 'Show-Loading': 'true' },
    });
  };

  public deleteAccount = (body: IdInputDto) => {
    return this.http.request<unknown>('delete', this.envUrl.deleteAccount, {
      body: body,
      headers: { 'Show-Loading': 'true' },
    });
  };
}
