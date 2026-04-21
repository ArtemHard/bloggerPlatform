import { WithId } from 'mongodb';
import { IUserDB } from '../../users/types/user.db.interface';

export interface IUsersRepository {
  create(user: IUserDB): Promise<WithId<IUserDB>>;

  delete(id: string): Promise<boolean>;

  findById(id: string): Promise<WithId<IUserDB> | null>;

  findByLoginOrEmail(loginOrEmail: string): Promise<WithId<IUserDB> | null>;

  doesExistByLoginOrEmail(login: string, email: string): Promise<WithId<IUserDB> | null>;

  getUserByConfirmEmailCode(code: string): Promise<WithId<IUserDB> | null>;

  confirmEmail(id: string): Promise<boolean>;

  updateEmailConfirmation({
    id,
    code,
    expirationDate,
  }: {
    id: string;
    code: string;
    expirationDate: Date;
  }): Promise<boolean>;

  getUserByRecoveryCode(code: string): Promise<WithId<IUserDB> | null>;

  updatePasswordRecovery({
    id,
    code,
    expirationDate,
  }: {
    id: string;
    code: string;
    expirationDate: Date;
  }): Promise<boolean>;

  confirmPasswordRecovery(id: string, newPassword: string): Promise<boolean>;
}
