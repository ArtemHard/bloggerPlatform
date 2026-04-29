import { injectable } from 'inversify';
import { IUserDB } from '../types/user.db.interface';
import { IUsersRepository } from '../../repositories/types/users.repository.interface';
import { UserModel, UserDocument } from '../domain/user.schema';

@injectable()
export class UsersRepository implements IUsersRepository {
  async create(user: IUserDB): Promise<UserDocument> {
    const newUser = new UserModel(user);
    await newUser.save();
    return newUser;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id);
  }

  async findByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserDocument | null> {
    return UserModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  }

  async doesExistByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<UserDocument | null> {
    const user = await UserModel.findOne({
      $or: [{ email }, { login }],
    });
    return user;
  }

  async getUserByConfirmEmailCode(
    code: string,
  ): Promise<UserDocument | null> {
    return UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
  }

  async confirmEmail(id: string): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: id },
      { 'emailConfirmation.isConfirmed': true },
    );
    return result.matchedCount === 1;
  }

  async updateEmailConfirmation({
    id,
    code,
    expirationDate,
  }: {
    id: string;
    code: string;
    expirationDate: Date;
  }): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: id },
      {
        'emailConfirmation.confirmationCode': code,
        'emailConfirmation.expirationDate': expirationDate,
      },
    );
    return result.matchedCount === 1;
  }

  async getUserByRecoveryCode(
    code: string,
  ): Promise<UserDocument | null> {
    return UserModel.findOne({
      'passwordRecovery.recoveryCode': code,
    });
  }

  async updatePasswordRecovery({
    id,
    code,
    expirationDate,
  }: {
    id: string;
    code: string;
    expirationDate: Date;
  }): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: id },
      {
        'passwordRecovery.recoveryCode': code,
        'passwordRecovery.expirationDate': expirationDate,
        'passwordRecovery.isConfirmed': false,
      },
    );
    return result.matchedCount === 1;
  }

  async confirmPasswordRecovery(id: string, newPassword: string): Promise<boolean> {
    const { bcryptService } = await import('../../../auth/adapters/bcrypt.service');
    const passwordHash = await bcryptService.generateHash(newPassword);
    
    const result = await UserModel.updateOne(
      { _id: id },
      {
        passwordHash: passwordHash,
        'passwordRecovery.isConfirmed': true,
      },
    );
    return result.matchedCount === 1;
  }
}
