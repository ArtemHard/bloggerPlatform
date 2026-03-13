import { Request, Response, Router } from "express";
import { passwordValidation } from "../middlewares/passwordvalidation";
import { loginOrEmailValidation } from "../middlewares/loginOremail.validation";
import { inputValidationResultMiddleware } from "../../core/middlewars/input-validtion-result.middleware";
import { LoginDto } from "../types/login.dto";
import { authService } from "../domain/auth.service";
import { HttpStatus } from "../../core/types/http-statuses";


export const authRouter = Router();

authRouter.post(
  '/login',
  passwordValidation,
  loginOrEmailValidation,
  inputValidationResultMiddleware,
  async (req: Request<{}, {}, LoginDto>, res: Response) => {

    const { loginOrEmail, password } = req.body;

    const accessToken = await authService.loginUser(loginOrEmail, password);
    if (!accessToken) return res.sendStatus(HttpStatus.Unauthorized);
// TODO добавить accessToken в ответ
    return res.status(HttpStatus.NoContent).send({ });
  },
);