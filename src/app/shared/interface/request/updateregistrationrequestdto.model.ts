import { RequestStatus } from '../../enum/request.status.enum';

export interface UpdateRegistrationRequestDto {
  RequestId: number;
  RegistrationStatus: RequestStatus;
  AdminComment: string | null;
}
