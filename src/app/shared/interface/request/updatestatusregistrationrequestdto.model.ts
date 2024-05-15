import { RequestStatus } from '../../enum/request.status.enum';

export interface UpdateStatusRegistrationRequestDto {
  UserId: string;
  Status: RequestStatus;
}
