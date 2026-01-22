export interface IVisitorRecord {
  country_code: string;
  visitors: number;
}

export interface IVisitorApiResponse {
  status: number;
  message: string;
  data: IVisitorRecord[];
}
