import { Injectable } from '@angular/core';
// change this to environment.prod if in prod
import { environment } from './../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EndpointService {
  private baseUrl = environment.urlAddress;

  // omdat we het hadden over api opsplitsen in micro services: grote kans verschillende api endpoints, dus deze klasse als base voor configuratie api

  // API
  constructor() {}

  get loginEndpoint() {
    return `${this.baseUrl}/Auth/Login`;
  }

  get refreshEndpoint() {
    return `${this.baseUrl}/Token/Refresh`;
  }

  get registerEndpoint() {
    return `${this.baseUrl}/Auth/Registration`;
  }

  get userViewApplication() {
    return `${this.baseUrl}/User/ViewApplication`;
  }

  get userViewApplicationGetDocuments() {
    return `${this.baseUrl}/User/GetApplicationDocuments`;
  }

  get allRequestApplications() {
    return `${this.baseUrl}/Admin/ViewApplications`;
  }

  get delUserRegisterDocument() {
    return `${this.baseUrl}/RegisterDocuments/Remove`;
  }

  get validateCurrentPassword() {
    return `${this.baseUrl}/Auth/ValidatePassword`;
  }

  get uploadRegisterDocument() {
    return `${this.baseUrl}/RegisterDocuments/UploadDocument`;
  }

  get updateUser() {
    return `${this.baseUrl}/User/Update`;
  }

  get updateRegisterRequest() {
    return `${this.baseUrl}/RegistrationRequest/UpdateStatus`;
  }

  get allSafeUsers() {
    return `${this.baseUrl}/User/GetSafeUsers`;
  }

  get userFromId() {
    return `${this.baseUrl}/User/GetSafeUserFromId`;
  }

  get updateRegisterRequestFull() {
    return `${this.baseUrl}/RegistrationRequest/Update`;
  }

  get validateEmailandId() {
    return `${this.baseUrl}/Auth/ValidateIdWithEmail`;
  }

  get sendPasswordrequest() {
    return `${this.baseUrl}/PasswordReset/Reset`;
  }

  get validatePasswordReset() {
    return `${this.baseUrl}/PasswordReset/ValidateReset`;
  }

  get updatePassword() {
    return `${this.baseUrl}/PasswordReset/UpdatePassword`;
  }

  get excursionsList() {
    return `${this.baseUrl}/Excursion/List`;
  }

  get excursionDetailsById() {
    return `${this.baseUrl}/Excursion/Details`;
  }

  get addExcursion() {
    return `${this.baseUrl}/Excursion/AddExcursion`;
  }

  get deleteExcursion() {
    return `${this.baseUrl}/Excursion/Remove`;
  }

  get updateExcursion() {
    return `${this.baseUrl}/Excursion/Update`;
  }

  get addExcursionParticipant() {
    return `${this.baseUrl}/ExcursionParticipants/Add`;
  }

  get removeExcursionParticipant() {
    return `${this.baseUrl}/ExcursionParticipants/Remove`;
  }

  get excursionParticipantTypeahead() {
    return `${this.baseUrl}/User/GetUsersTypeahead`;
  }

  get addMultipleExcursionParticipant() {
    return `${this.baseUrl}/ExcursionParticipants/AddMultiple`;
  }

  get homeDashboard() {
    return `${this.baseUrl}/Home/Dashboard`;
  }

  get enableUser() {
    return `${this.baseUrl}/User/Enable`;
  }

  get disableUser() {
    return `${this.baseUrl}/User/Disable`;
  }

  get deleteAccount() {
    return `${this.baseUrl}/User/Delete`;
  }

  // MAIL
  get ResendEmailVerification() {
    return `${this.baseUrl}/Auth/ResendValidationEmail`;
  }
}
