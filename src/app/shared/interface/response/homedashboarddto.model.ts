export interface HomeDashboardDto {
  randomExcursionInfos: ExcursionInfo[];
  totalExcursions: number;
  upcomingExcursions: number;
  participatedInExcursions: number;
  goingToParticipateInExcursions: number;
}

export interface ExcursionInfo {
  id: string;
  title: string;
  description: string;
  imageName: string;
}
