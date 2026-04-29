import { IUserDB } from './user.db.interface';
import { HydratedDocument, Model } from 'mongoose';

// Mongoose document type with custom methods
export interface IUserMethods {
  updatePassword(newPasswordHash: string): void;
  confirmEmail(): void;
  updateEmailConfirmation(code: string, expirationDate: Date): void;
  updatePasswordRecovery(code: string, expirationDate: Date): void;
  confirmPasswordRecovery(): void;
}

// Mongoose static methods type
export interface IUserStatics {
  createUser(login: string, email: string, passwordHash: string): HydratedDocument<IUserDB, IUserMethods>;
}

// Document type
export type UserDocument = HydratedDocument<IUserDB, IUserMethods>;

// Model type
export type UserModelType = Model<IUserDB, IUserStatics, IUserMethods>;
