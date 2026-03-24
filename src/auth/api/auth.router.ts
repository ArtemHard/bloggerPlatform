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

    const result = await authService.loginUser(loginOrEmail, password);

    if (result.status !== ResultStatus.Success) {
      return res
        .status(resultCodeToHttpException(result.status))
        .send(result.extensions);
    }

    return res
      .status(HttpStatus.Ok)
      .send({ accessToken: result?.data?.accessToken ?? ' получил null' });
  },
)

authRouter.get(
  '/me',
  accessTokenGuard,
  async (req: RequestWithUserId<IdType>, res: Response) => {
    const userId = req.user?.id as string;

    if (!userId) return res.sendStatus(HttpStatus.Unauthorized);
    const me = await usersQwRepository.findById(userId);

    return res.status(HttpStatus.Ok).send(me);
  },
);