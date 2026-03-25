import { WithId } from 'mongodb';
import { PromiseResult } from '../../common/result/result.type';
import { usersRepository } from '../../domain/users/infrastructure/user.repository';
import { bcryptService } from '../adapters/bcrypt.service';
import { IUserDB } from '../../domain/users/types/user.db.interface';
import { ResultStatus } from '../../common/result/resultCode';
import { jwtService } from '../adapters/jwt.service';

export const authService = {
  async loginUser(
    loginOrEmail: string,
    password: string,
  ): Promise<PromiseResult<{ accessToken: string } | null>> {
    const result = await this.checkUserCredentials(
      loginOrEmail,
      password,
    );

    if (result.status !== ResultStatus.Success) {
      // For NotFound and BadRequest, return a generic unauthorized response
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'loginOrEmail', message: 'Unauthorized' }],
      };
    }

    const accessToken = await jwtService.createToken(result.data!._id.toString());

    return {
      status: ResultStatus.Success,
      data: { accessToken },
      extensions: [],
    };
  },

  async checkUserCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<PromiseResult<WithId<IUserDB> | null>> {
    const user = await usersRepository.findByLoginOrEmail(loginOrEmail);

    if (!user)
      return {
        status: ResultStatus.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'loginOrEmail', message: 'Not Found' }],
      };

    const isPassCorrect = await bcryptService.checkPassword(
      password,
      user.passwordHash,
    );

    if (!isPassCorrect)
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'password', message: 'Wrong password' }],
      };

    return {
      status: ResultStatus.Success,
      data: user,
      extensions: [],
    };
  },
};
