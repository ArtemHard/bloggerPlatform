export interface IUserDB {
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}