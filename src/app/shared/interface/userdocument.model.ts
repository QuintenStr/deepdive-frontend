export interface UserDocument {
  id: string;
  userIdFK: string;
  createdOn: string;
  documentName: string;
  documentType: number;
}
