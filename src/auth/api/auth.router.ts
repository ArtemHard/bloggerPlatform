import { Request, Response, Router } from 'express';
import { passwordValidation } from '../middlewares/passwordvalidation';
import { loginOrEmailValidation } from '../middlewares/loginOremail.validation';
import {
  createErrorMessages,
  inputValidationResultMiddleware,
} from '../../core/middlewars/input-validtion-result.middleware';
import { rateLimitMiddleware } from '../../core/middlewars/rate-limit.middleware';
import { EmailDto, LoginDto } from '../types/login.dto';
import { authService } from '../domain/auth.service';
import { jwtService } from '../adapters/jwt.service';
import { HttpStatus } from '../../core/types/http-statuses';
import { ResultStatus } from '../../common/result/resultCode';
import { resultCodeToHttpException } from '../../common/result/resultCodeToHttpException';
import { accessTokenGuard } from './guards/access.token.guard';
import { refreshTokenGuard } from './guards/refresh.token.guard';
import { RequestWithUserId } from '../../core/types/requests';
import { IdType } from '../../core/types/id';
import { usersQwRepository } from '../../domain/users/infrastructure/user.query.repository';
import { emailInputDtoValidation } from '../validation/userInputDtoValidation';
import { CreateUserDto } from '../../domain/users/types/create-user.dto';
import { createUserSchema } from '../validation/shemas/create-user-shema';
import { createUserInputDtoValidation } from '../validation/createUserInputDtoValidation';
import { ValidationError } from '../../core/types/validationError';

export const authRouter = Router();

authRouter
  .post(
    '/login',
    rateLimitMiddleware,
    passwordValidation,
    loginOrEmailValidation,
    inputValidationResultMiddleware,
    async (req: Request<{}, {}, LoginDto>, res: Response) => {
      const { loginOrEmail, password } = req.body;
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'Unknown Device';

      try {
        const result = await authService.loginUser(loginOrEmail, password, ip, userAgent);

        if (result.status !== ResultStatus.Success || result.data === null) {
          const statusCode = resultCodeToHttpException(result.status);
          return res.status(statusCode).send(result.extensions);
        }

        res.cookie('refreshToken', result.data.refreshToken, {
          httpOnly: true,
          secure: true,
          maxAge: 20 * 1000,
        });

        return res
          .status(HttpStatus.Ok)
          .send({ accessToken: result.data!.accessToken });
      } catch (error) {
        console.error('Login error:', error);
        console.error(
          'Error stack:',
          error instanceof Error ? error.stack : 'Not an Error object',
        );
        return res.sendStatus(HttpStatus.InternalServerError);
      }
    },
  )
  .post(
    '/refresh-token',
    refreshTokenGuard,
    async (req: RequestWithUserId<IdType>, res: Response) => {
      const userId = req.user?.id as string;
      const oldRefreshToken = (req as any).refreshToken;

      if (!userId || !oldRefreshToken) return res.sendStatus(HttpStatus.Unauthorized);

      const tokenData = await jwtService.verifyRefreshToken(oldRefreshToken);
      if (!tokenData) return res.sendStatus(HttpStatus.Unauthorized);

      const result = await authService.refreshTokens(userId, oldRefreshToken, tokenData.deviceId);

      if (result.status !== ResultStatus.Success) {
        return res.sendStatus(HttpStatus.Unauthorized);
      }
      res.cookie('refreshToken', result.data?.refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 20 * 1000,
      });

      return res
        .status(HttpStatus.Ok)
        .send({ accessToken: result.data!.accessToken });
    },
  )
  .post(
    '/logout',
    refreshTokenGuard,
    async (req: RequestWithUserId<IdType>, res: Response) => {
      const refreshToken = (req as any).refreshToken;

      if (!refreshToken) return res.sendStatus(HttpStatus.Unauthorized);

      const tokenData = await jwtService.verifyRefreshToken(refreshToken);
      if (!tokenData) return res.sendStatus(HttpStatus.Unauthorized);

      const result = await authService.logout(refreshToken, tokenData.deviceId);

      if (result.status !== ResultStatus.Success) {
        return res.sendStatus(HttpStatus.Unauthorized);
      }

      res.clearCookie('refreshToken');
      return res.sendStatus(HttpStatus.NoContent);
    },
  )
  .get(
    '/me',
    accessTokenGuard,
    async (req: RequestWithUserId<IdType>, res: Response) => {
      const userId = req.user?.id as string;

      if (!userId) return res.sendStatus(HttpStatus.Unauthorized);
      const me = await usersQwRepository.findById(userId);
      if (me) {
        const { email, id, login } = me;
        return res.status(HttpStatus.Ok).send({ email, login, userId: id });
      }

      return res.sendStatus(HttpStatus.NotFound);
    },
  )
  // Registration in the system. Email with confirmation code will be send to passed email address
  .post(
    '/registration',
    rateLimitMiddleware,
    async (req: Request<{}, {}, CreateUserDto>, res: Response) => {
      const { email, login, password } = req.body;

      const errors = createUserInputDtoValidation({ email, login, password });

      if (errors.length > 0) {
        return res
          .status(HttpStatus.BadRequest)
          .send(createErrorMessages(errors));
      }

      const result = await authService.registerUser({ email, login, password });
      if (result.status !== ResultStatus.Success) {
        const statusCode = resultCodeToHttpException(result.status);

        return res
          .status(statusCode)
          .send(createErrorMessages(result.extensions as ValidationError[]));
      }
      return res.sendStatus(HttpStatus.NoContent);
    },
    // .post(
    //   'registration-email-resending',
    //   async (req: Request<{}, {}, EmailDto>, res: Response) => {
    //     const { email } = req.body;

    //     const errors = emailInputDtoValidation({ email });

    //     if (errors.length > 0) {
    //       return res
    //         .status(HttpStatus.BadRequest)
    //         .send(createErrorMessages(errors));
    //     }

    //     const result = await authService.resendRegistrationEmail(email);
    //     if (result.status !== ResultStatus.Success) {
    //       const statusCode = resultCodeToHttpException(result.status);
    //       return res.status(statusCode).send(result.extensions);
    //     }
    //     return res.sendStatus(HttpStatus.NoContent);
    //   },
  )
  //Confirm registration
  .post(
    '/registration-confirmation',
    rateLimitMiddleware,
    async (req: Request<{}, {}, { code: string }>, res: Response) => {
      const { code } = req.body;

      const result = await authService.confirmEmail(code);

      // const result = await authService.registerUser({email, login, password});
      if (result.status !== ResultStatus.Success) {
        const statusCode = resultCodeToHttpException(result.status);
        return res.status(statusCode).send(createErrorMessages(result.extensions as ValidationError[]));
      }
      return res.sendStatus(HttpStatus.NoContent);
    },
  )
  //Registration in the system email resending
  .post(
    '/registration-email-resending',
    rateLimitMiddleware,
    async (req: Request<{}, {}, { email: string }>, res: Response) => {
      const { email } = req.body;

      const errors = emailInputDtoValidation({ email });

      if (errors.length > 0) {
        return res
          .status(HttpStatus.BadRequest)
          .send(createErrorMessages(errors));
      }

      const result = await authService.resendRegistrationEmail({ email });

      if (result.status !== ResultStatus.Success) {
        const statusCode = resultCodeToHttpException(result.status);
        return res.status(statusCode).send(createErrorMessages(result.extensions as ValidationError[]));
      }
      return res.sendStatus(HttpStatus.NoContent);
    },
  );
