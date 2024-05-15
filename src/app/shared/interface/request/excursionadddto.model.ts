export interface AddExcursion {
  Title: string;
  Description: string;
  DateTime: string;
  ImageName: string;
  Coordinates: {
    Lat: number;
    Long: number;
  };
}
