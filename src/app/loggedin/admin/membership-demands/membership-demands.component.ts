import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../shared/service/user.service';
import { ViewApplicationDto } from '../../../shared/interface/response/viewapplicationresponsedto.model';
import { RegistrationDocumentTypes } from '../../../shared/enum/registrationdocument.types.enum';
import { UserDocument } from '../../../shared/interface/userdocument.model';
import { AzureBlobStorageService } from '../../../shared/service/azureblobstorage.service';
import { UpdateRegistrationRequestDto } from '../../../shared/interface/request/updateregistrationrequestdto.model';
import { RequestStatus } from '../../../shared/enum/request.status.enum';
import { AppToastService } from '../../../shared/service/toast.service';

@Component({
  selector: 'app-membership-demands',
  templateUrl: './membership-demands.component.html',
  styleUrl: './membership-demands.component.scss',
})
export class MembershipDemandsComponent implements OnInit {
  applications!: ViewApplicationDto[];
  documentType = RegistrationDocumentTypes;
  requestStatus = RequestStatus;
  comment: string = '';

  constructor(
    private userService: UserService,
    private blobService: AzureBlobStorageService,
    private toastService: AppToastService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData(): void {
    this.userService.getAllApplicationsRequestStatus().subscribe({
      next: (response: ViewApplicationDto[]) => {
        this.applications = response;
      },
      error: () => {
        this.toastService.show('Oops', 'Something went wrong');
      },
    });
  }

  getDocumentTypeString(value: number): string {
    return RegistrationDocumentTypes[value];
  }

  onDocumentClick(document: UserDocument) {
    this.viewDocument(document);
  }

  viewDocument(docu: UserDocument): void {
    this.blobService.downloadFile(docu.id, 'registerdocuments', blob => {
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    });
  }

  formatDate(dateString: string): string {
    const datetimeStringWithZ = dateString + 'Z';
    const date = new Date(datetimeStringWithZ);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  updateRequest(
    id: number,
    status: RequestStatus,
    adminComment: string | null
  ): void {
    const body: UpdateRegistrationRequestDto = {
      RequestId: id,
      RegistrationStatus: status,
      AdminComment: adminComment,
    };

    if (
      body.RegistrationStatus === RequestStatus.WaitingForUserChanges &&
      body.AdminComment === ''
    ) {
      this.toastService.show(
        'Warning',
        'Please fill in a comment before you can ask for more informartion so the user knows what is wrong with his/her application.'
      );
      return;
    }

    this.userService.updateRequestFull(body).subscribe({
      next: () => {
        this.loadData();
      },
      error: () => {
        this.toastService.show('Oops', 'Something went wrong');
      },
    });
  }
}
