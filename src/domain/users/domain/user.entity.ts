import { randomUUID } from 'crypto';

export const expirationDateFunc = () => new Date(Date.now() + 60 * 60 * 1000);

export class User {
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  };

  constructor(login: string, email: string, hash: string) {
    this.login = login;
    this.email = email;
    this.passwordHash = hash;
    this.createdAt = new Date();

    this.emailConfirmation = {
      expirationDate: expirationDateFunc(), // +1 час
      confirmationCode: randomUUID(),
      isConfirmed: false,
    };
  }
}
