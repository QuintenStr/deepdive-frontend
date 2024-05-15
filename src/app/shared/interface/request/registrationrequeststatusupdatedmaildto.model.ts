import { RequestStatus } from '../../enum/request.status.enum';

export interface RegistrationRequestStatusUpdated {
  Email: string;
  Status: RequestStatus;
  FirstName: string;
  AdminComment: string | null;
}
