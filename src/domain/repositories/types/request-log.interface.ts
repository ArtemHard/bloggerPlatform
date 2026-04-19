export interface IRequestLog {
  IP: string;
  URL: string;
  date: Date;
  userId?: string;
  deviceId?: string;
  title?: string;
  exp?: Date;
}
