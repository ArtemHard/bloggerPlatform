import { IUserDB } from '../../users/types/user.db.interface';
import { UserDocument } from '../../users/domain/user.schema';

export interface IUsersRepository {
  create(user: IUserDB): Promise<UserDocument>;

  delete(id: string): Promise<boolean>;

  findById(id: string): Promise<UserDocument | null>;

  findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null>;

  doesExistByLoginOrEmail(login: string, email: string): Promise<UserDocument | null>;

  getUserByConfirmEmailCode(code: string): Promise<UserDocument | null>;

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

  getUserByRecoveryCode(code: string): Promise<UserDocument | null>;

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
