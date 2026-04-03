export interface IUserDB {
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  emailConfirmation: {
    // доп поля необходимые для подтверждения
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  };
}
