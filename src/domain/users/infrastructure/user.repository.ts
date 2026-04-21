import { injectable } from 'inversify';
import { ObjectId, WithId } from 'mongodb';
import { IUserDB } from '../types/user.db.interface';
import { usersCollection } from '../../../db/mongo.db';
import { IUsersRepository } from '../../repositories/types/users.repository.interface';

@injectable()
export class UsersRepository implements IUsersRepository {
  async create(user: IUserDB): Promise<WithId<IUserDB>> {
    const newUser = await usersCollection.insertOne({ ...user });

    return { ...user, _id: newUser.insertedId };
  }

  async delete(id: string): Promise<boolean> {
    const isDel = await usersCollection.deleteOne({ _id: new ObjectId(id) });
    return isDel.deletedCount === 1;
  }

  async findById(id: string): Promise<WithId<IUserDB> | null> {
    return usersCollection.findOne({ _id: new ObjectId(id) });
  }

  async findByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<WithId<IUserDB> | null> {
    return usersCollection.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  }

  async doesExistByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<WithId<IUserDB> | null> {
    const user = await usersCollection.findOne({
      $or: [{ email }, { login }],
    });
    return user;
  }

  async getUserByConfirmEmailCode(
    code: string,
  ): Promise<WithId<IUserDB> | null> {
    return await usersCollection.findOne({
      'emailConfirmation.confirmationCode': code,
    });
  }

  async confirmEmail(id: string): Promise<boolean> {
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { 'emailConfirmation.isConfirmed': true } },
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
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          'emailConfirmation.confirmationCode': code,
          'emailConfirmation.expirationDate': expirationDate,
        },
      },
    );
    return result.matchedCount === 1;
  }

  async getUserByRecoveryCode(
    code: string,
  ): Promise<WithId<IUserDB> | null> {
    return await usersCollection.findOne({
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
    // First check if user has passwordRecovery field
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    
    if (!user) {
      return false;
    }

    let result;
    if (user.passwordRecovery) {
      // Update existing passwordRecovery field
      result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            'passwordRecovery.recoveryCode': code,
            'passwordRecovery.expirationDate': expirationDate,
            'passwordRecovery.isConfirmed': false,
          },
        }
      );
    } else {
      // Create passwordRecovery field for existing users
      result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            passwordRecovery: {
              recoveryCode: code,
              expirationDate: expirationDate,
              isConfirmed: false,
            },
          },
        }
      );
    }
    
    return result.matchedCount === 1;
  }

  async confirmPasswordRecovery(id: string, newPassword: string): Promise<boolean> {
    const { bcryptService } = await import('../../../auth/adapters/bcrypt.service');
    const passwordHash = await bcryptService.generateHash(newPassword);
    
    // First check if user has passwordRecovery field
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    
    if (!user) {
      return false;
    }

    let result;
    if (user.passwordRecovery) {
      // Update existing passwordRecovery field
      result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            passwordHash: passwordHash,
            'passwordRecovery.isConfirmed': true,
          },
        }
      );
    } else {
      // Create passwordRecovery field for existing users and update password
      result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            passwordHash: passwordHash,
            passwordRecovery: {
              recoveryCode: '',
              expirationDate: new Date(),
              isConfirmed: true,
            },
          },
        }
      );
    }
    
    return result.matchedCount === 1;
  }
}
