export interface UpdateExcursionRequestDto {
  Id: string;
  Title: string;
  Description: string;
  DateTime: string;
  ImageName: string | null;
  coordinates: CoordinatesDto2;
}

export interface CoordinatesDto2 {
  lat: number;
  long: number;
}
