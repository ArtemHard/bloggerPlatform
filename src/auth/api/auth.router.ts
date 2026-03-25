import { Request, Response, Router } from 'express';
import { passwordValidation } from '../middlewares/passwordvalidation';
import { loginOrEmailValidation } from '../middlewares/loginOremail.validation';
import { inputValidationResultMiddleware } from '../../core/middlewars/input-validtion-result.middleware';
import { LoginDto } from '../types/login.dto';
import { authService } from '../domain/auth.service';
import { HttpStatus } from '../../core/types/http-statuses';
import { ResultStatus } from '../../common/result/resultCode';
import { resultCodeToHttpException } from '../../common/result/resultCodeToHttpException';
import { accessTokenGuard } from './guards/access.token.guard';
import { RequestWithUserId } from '../../core/types/requests';
import { IdType } from '../../core/types/id';
import { usersQwRepository } from '../../domain/users/infrastructure/user.query.repository';

export const authRouter = Router();

authRouter.post(
  '/login',
  passwordValidation,
  loginOrEmailValidation,
  inputValidationResultMiddleware,
  async (req: Request<{}, {}, LoginDto>, res: Response) => {
    const { loginOrEmail, password } = req.body;


    try {
      const result = await authService.loginUser(loginOrEmail, password);

      if (result.status !== ResultStatus.Success) {
        const statusCode = resultCodeToHttpException(result.status);
        return res
          .status(statusCode)
          .send(result.extensions);
      }

      return res
        .status(HttpStatus.Ok)
        .send({ accessToken: result.data!.accessToken });
    } catch (error) {
      return res.sendStatus(HttpStatus.InternalServerError);
    }
  },
);

authRouter.get(
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
);