export interface UpdateUserInputDto {
  Id: string;
  FirstName: string;
  LastName: string;
  BirthDate: string;
  UserName: string;
  Email: string;
  Password: string | null | undefined;
  PhoneNumber: string;
}
