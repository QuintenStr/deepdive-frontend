import { RegistrationDocumentTypes } from '../../enum/registrationdocument.types.enum';

export interface UploadRegisterDocumentDto {
  Id: string;
  DocumentName: string;
  UserIdFK: string;
  DocumentType: RegistrationDocumentTypes;
  CreatedOn: string;
}
