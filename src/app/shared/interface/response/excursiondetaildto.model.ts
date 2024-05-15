export interface ExcursionDetailInfo {
  id: string;
  title: string;
  description: string;
  createdByUser?: UserDto;
  createdOn: string;
  dateTime: string;
  coordinates: CoordinatesDto;
  imageName: string;
  participants: ParticipantDto[];
}

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
}

export interface CoordinatesDto {
  lat: number;
  long: number;
}

export interface ParticipantDto {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
}
