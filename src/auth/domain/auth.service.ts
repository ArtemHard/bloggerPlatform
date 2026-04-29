import { inject, injectable } from 'inversify';
import { WithId } from 'mongodb';
import { PromiseResult } from '../../common/result/result.type';
import { TYPES } from '../../ioc/ioc.types';
import { IUsersRepository } from '../../domain/repositories/types/users.repository.interface';
import { IRequestLogsRepository } from '../../domain/repositories/types/request-logs.repository.interface';
import { ITokensRepository } from '../../domain/repositories/types/tokens.repository.interface';
import { bcryptService } from '../adapters/bcrypt.service';
import { IUserDB } from '../../domain/users/types/user.db.interface';
import { ResultStatus } from '../../common/result/resultCode';
import { jwtService } from '../adapters/jwt.service';
import { EmailDto } from '../types/login.dto';
import { CreateUserDto } from '../../domain/users/validation/types/create-user.dto';
import {
  expirationDateFunc,
  User,
} from '../../domain/users/domain/user.entity';
import { randomUUID } from 'node:crypto';
import { nodemailerService } from '../adapters/nodemailer.service';
import { emailExamples } from '../adapters/emailExamples';

@injectable()
export class AuthService {
  @inject(TYPES.UsersRepository) private usersRepository!: IUsersRepository;
  @inject(TYPES.RequestLogsRepository) private requestLogsRepository!: IRequestLogsRepository;
  @inject(TYPES.TokensRepository) private tokensRepository!: ITokensRepository;

  constructor() {}

  async loginUser(
    loginOrEmail: string,
    password: string,
    ip: string,
    userAgent: string,
  ): Promise<PromiseResult<{ accessToken: string; refreshToken: string; deviceId: string } | null>> {
    const result = await this.checkUserCredentials(loginOrEmail, password);

    if (result.status !== ResultStatus.Success) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'loginOrEmail', message: 'Unauthorized' }],
      };
    }

    const userId = result.data!._id.toString();
    const deviceId = randomUUID();
    const accessToken = await jwtService.createAccessToken(userId);
    const refreshToken = await jwtService.createRefreshToken(userId, deviceId);

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (process.env.RT_TIME ? parseInt(process.env.RT_TIME, 10) : 20));

    await this.tokensRepository.create({
      userId,
      token: refreshToken,
      createdAt: new Date(),
      expiresAt,
      isRevoked: false,
      deviceId
    });

    // Create device record
    await this.requestLogsRepository.createDevice({
      IP: ip,
      URL: '',
      date: new Date(),
      userId,
      deviceId,
      title: userAgent || 'Unknown Device',
      exp: expiresAt
    });

    return {
      status: ResultStatus.Success,
      data: { accessToken, refreshToken, deviceId },
      extensions: [],
    };
  }

  async refreshTokens(
    userId: string,
    oldRefreshToken: string,
    deviceId: string,
  ): Promise<PromiseResult<{ accessToken: string; refreshToken: string } | null>> {
    // Revoke the old refresh token
    await this.tokensRepository.revokeToken(oldRefreshToken);

    // Clean up expired tokens
    await this.tokensRepository.revokeExpiredTokens();

    const accessToken = await jwtService.createAccessToken(userId);
    const refreshToken = await jwtService.createRefreshToken(userId, deviceId);

    // Store new refresh token in database
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (process.env.RT_TIME ? parseInt(process.env.RT_TIME, 10) : 20));

    await this.tokensRepository.create({
      userId,
      token: refreshToken,
      createdAt: new Date(),
      expiresAt,
      isRevoked: false,
      deviceId
    });

    // Update device lastActiveDate and exp
    await this.requestLogsRepository.updateLastActiveDate(deviceId, new Date(), expiresAt);

    return {
      status: ResultStatus.Success,
      data: { accessToken, refreshToken },
      extensions: [],
    };
  }

  async checkUserCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<PromiseResult<WithId<IUserDB> | null>> {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);

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
  }

  async registerUser({
    email,
    login,
    password,
  }: CreateUserDto): Promise<PromiseResult<any>> {
    const user = await this.usersRepository.doesExistByLoginOrEmail(login, email);

    if (user)
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [
          {
            field: user.email === email ? 'email' : 'login',
            message: 'Already Registered',
          },
        ],
      };

    const passwordHash = await bcryptService.generateHash(password);

    const newUser = new User(login, email, passwordHash);

    await this.usersRepository.create(newUser);

    nodemailerService
      .sendEmail(
        newUser.email,
        newUser.emailConfirmation.confirmationCode,
        emailExamples.registrationEmail,
      )
      .catch((er) => console.error('error in send email:', er));

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  }

  async confirmEmail(code: string): Promise<PromiseResult<any>> {
    //TODO confirm email some logic

    const isUuid = new RegExp(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    ).test(code);

    if (!isUuid) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'code', message: 'Incorrect code' }],
      };
    }

    const user = await this.usersRepository.getUserByConfirmEmailCode(code);

    if (!user) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'code', message: 'code does not exist' }],
      };
    }

    if (user.emailConfirmation.isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'code', message: 'code already been applied' }],
      };
    }

    const expirationDate = new Date(user.emailConfirmation.expirationDate);

    if (expirationDate < new Date())
      return {
        status: ResultStatus.NotFound,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'code', message: 'code alredy expired' }],
      };

    await this.usersRepository.confirmEmail(user._id.toString());

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  }

  async logout(refreshToken: string, deviceId: string): Promise<PromiseResult<null>> {
    const tokenExists = await this.tokensRepository.findByToken(refreshToken);

    if (!tokenExists) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Invalid refresh token',
        extensions: [],
      };
    }

    // Revoke the specific refresh token
    await this.tokensRepository.revokeToken(refreshToken);

    // Delete device record
    await this.requestLogsRepository.deleteByDeviceId(deviceId);

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  }

  async resendRegistrationEmail({ email }: EmailDto) {
    const user = await this.usersRepository.findByLoginOrEmail(email);

    if (!user)
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'email', message: 'Not Found' }],
      };

    if (user.emailConfirmation.isConfirmed)
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Email already confirmed',
        extensions: [{ field: 'email', message: 'Email is already confirmed' }],
      };

    const newConfirmationCode = randomUUID();

    const updateResult = await this.usersRepository.updateEmailConfirmation({
      id: user._id.toString(),
      code: newConfirmationCode,
      expirationDate: expirationDateFunc(),
    });

    if (!updateResult) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Not Found',
        extensions: [
          { field: 'code', message: 'Cannot update code to database' },
        ],
      };
    }

    if (updateResult) {
      nodemailerService
        .sendEmail(
          user.email,
          newConfirmationCode,
          emailExamples.registrationEmail,
        )
        .catch((er) => console.error('error in send email:', er));
    }

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  }

  async passwordRecovery(email: string): Promise<PromiseResult<any>> {
    const user = await this.usersRepository.findByLoginOrEmail(email);

    // Always return success for security (prevent email enumeration)
    if (!user) {
      return {
        status: ResultStatus.Success,
        data: null,
        extensions: [],
      };
    }

    const newRecoveryCode = randomUUID();

    const updateResult = await this.usersRepository.updatePasswordRecovery({
      id: user._id.toString(),
      code: newRecoveryCode,
      expirationDate: expirationDateFunc(),
    });

    if (!updateResult) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Cannot update recovery code',
        extensions: [
          { field: 'code', message: 'Cannot update code to database' },
        ],
      };
    }

    const emailResult = await nodemailerService.sendEmail(
      user.email,
      newRecoveryCode,
      emailExamples.passwordRecoveryEmail(newRecoveryCode),
    );
    
    if (!emailResult.success) {
      console.error('Password recovery email failed:', emailResult.error);
    }

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  }

  async confirmNewPassword(recoveryCode: string, newPassword: string): Promise<PromiseResult<any>> {
    const isUuid = new RegExp(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    ).test(recoveryCode);

    if (!isUuid) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'recoveryCode', message: 'Incorrect recovery code' }],
      };
    }

    const user = await this.usersRepository.getUserByRecoveryCode(recoveryCode);

    if (!user) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'recoveryCode', message: 'Recovery code does not exist' }],
      };
    }

    if (user.passwordRecovery.isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'recoveryCode', message: 'Recovery code already been applied' }],
      };
    }

    const expirationDate = new Date(user.passwordRecovery.expirationDate);

    if (expirationDate < new Date())
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'recoveryCode', message: 'Recovery code already expired' }],
      };

    const updateResult = await this.usersRepository.confirmPasswordRecovery(
      user._id.toString(),
      newPassword
    );

    if (!updateResult) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Cannot update password',
        extensions: [
          { field: 'newPassword', message: 'Cannot update password to database' },
        ],
      };
    }

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  }
}
