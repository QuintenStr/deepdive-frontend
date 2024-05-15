import { RequestStatus } from '../../enum/request.status.enum';
import { UserDocument } from '../userdocument.model';

export interface ViewApplicationDto {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  phoneNumber: string;
  email: string;
  birthDate: string;
  status: RequestStatus;
  adminComment?: string | null;
  createdOn: string;
  editedOn?: string | null;
  approvedOrDeniedOn?: string | null;
  documentsInfo: UserDocument[];
}
