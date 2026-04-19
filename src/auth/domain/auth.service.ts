import { WithId } from 'mongodb';
import { PromiseResult } from '../../common/result/result.type';
import { usersRepository } from '../../domain/users/infrastructure/user.repository';
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
import { nodemailerService } from '../adapters/nodemailer.service';
import { emailExamples } from '../adapters/emailExamples';
import e from 'express';
import { randomUUID } from 'node:crypto';
import { tokensRepository } from '../infrastructure/token.repository';
import { requestLogsRepository } from '../../domain/repositories/request-logs.repository';

export const authService = {
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

    await tokensRepository.create({
      userId,
      token: refreshToken,
      createdAt: new Date(),
      expiresAt,
      isRevoked: false,
      deviceId
    });

    // Create device record
    await requestLogsRepository.createDevice({
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
  },

  async refreshTokens(
    userId: string,
    oldRefreshToken: string,
    deviceId: string,
  ): Promise<PromiseResult<{ accessToken: string; refreshToken: string } | null>> {
    // Revoke the old refresh token
    await tokensRepository.revokeToken(oldRefreshToken);

    // Clean up expired tokens
    await tokensRepository.revokeExpiredTokens();

    const accessToken = await jwtService.createAccessToken(userId);
    const refreshToken = await jwtService.createRefreshToken(userId, deviceId);

    // Store new refresh token in database
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (process.env.RT_TIME ? parseInt(process.env.RT_TIME, 10) : 20));

    await tokensRepository.create({
      userId,
      token: refreshToken,
      createdAt: new Date(),
      expiresAt,
      isRevoked: false,
      deviceId
    });

    // Update device lastActiveDate and exp
    await requestLogsRepository.updateLastActiveDate(deviceId, new Date(), expiresAt);

    return {
      status: ResultStatus.Success,
      data: { accessToken, refreshToken },
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
  async registerUser({
    email,
    login,
    password,
  }: CreateUserDto): Promise<PromiseResult<any>> {
    const user = await usersRepository.doesExistByLoginOrEmail(login, email);

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

    await usersRepository.create(newUser);

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
  },

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

    const user = await usersRepository.getUserByConfirmEmailCode(code);

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

    await usersRepository.confirmEmail(user._id.toString());

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  },

  async logout(refreshToken: string, deviceId: string): Promise<PromiseResult<null>> {
    const tokenExists = await tokensRepository.findByToken(refreshToken);

    if (!tokenExists) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Invalid refresh token',
        extensions: [],
      };
    }

    // Revoke the specific refresh token
    await tokensRepository.revokeToken(refreshToken);

    // Delete device record
    await requestLogsRepository.deleteByDeviceId(deviceId);

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  },

  async resendRegistrationEmail({ email }: EmailDto) {
    const user = await usersRepository.findByLoginOrEmail(email);

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

    const updateResult = await usersRepository.updateEmailConfirmation({
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
  },

  // async resendRegistrationEmail({email}: EmailDto) {

  //   const user = await usersRepository.findByLoginOrEmail(email);

  //   if (!user)
  //     return {
  //       status: ResultStatus.NotFound,
  //       data: null,
  //       errorMessage: 'Not Found',
  //       extensions: [{ field: 'loginOrEmail', message: 'Not Found' }],
  //     };

  // }
};
