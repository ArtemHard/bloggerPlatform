import { Request, Response, Router } from 'express';
import { securityService } from '../domain/security.service';
import { jwtService } from '../adapters/jwt.service';
import { refreshTokenGuard } from './guards/refresh.token.guard';
import { RequestWithUserId } from '../../core/types/requests';
import { IdType } from '../../core/types/id';
import { HttpStatus } from '../../core/types/http-statuses';
import { ResultStatus } from '../../common/result/resultCode';
import { resultCodeToHttpException, resultCodeToHttpExceptionForDevices } from '../../common/result/resultCodeToHttpException';

export const securityRouter = Router();

securityRouter
  .get(
    '/devices',
    refreshTokenGuard,
    async (req: RequestWithUserId<IdType>, res: Response) => {
      const userId = req.user?.id as string;
      const refreshToken = (req as any).refreshToken;

      if (!userId || !refreshToken) return res.sendStatus(HttpStatus.Unauthorized);

      const result = await securityService.getAllDevices(userId);

      if (result.status !== ResultStatus.Success) {
        const statusCode = resultCodeToHttpException(result.status);
        return res.sendStatus(statusCode);
      }

      return res.status(HttpStatus.Ok).send(result.data);
    },
  )
  .delete(
    '/devices',
    refreshTokenGuard,
    async (req: RequestWithUserId<IdType>, res: Response) => {
      const userId = req.user?.id as string;
      const refreshToken = (req as any).refreshToken;

      if (!userId || !refreshToken) return res.sendStatus(HttpStatus.Unauthorized);

      const tokenData = await jwtService.verifyRefreshToken(refreshToken);
      if (!tokenData) return res.sendStatus(HttpStatus.Unauthorized);

      const result = await securityService.deleteAllOtherDevices(userId, tokenData.deviceId);

      if (result.status !== ResultStatus.Success) {
        const statusCode = resultCodeToHttpException(result.status);
        return res.sendStatus(statusCode);
      }

      return res.sendStatus(HttpStatus.NoContent);
    },
  )
  .delete(
    '/devices/:deviceId',
    refreshTokenGuard,
    async (req: Request<{ deviceId: string }, {}, {}, {}, IdType>, res: Response) => {
      const refreshToken = (req as any).refreshToken;
      const { deviceId } = req.params;

      if (!refreshToken) return res.sendStatus(HttpStatus.Unauthorized);

      const tokenData = await jwtService.decodeRefreshToken(refreshToken);
      if (!tokenData) return res.sendStatus(HttpStatus.Unauthorized);

      const userId = tokenData.userId;

      const result = await securityService.deleteDevice(userId, deviceId);

      if (result.status !== ResultStatus.Success) {
        const statusCode = resultCodeToHttpExceptionForDevices(result.status);
        return res.sendStatus(statusCode);
      }

      return res.sendStatus(HttpStatus.NoContent);
    },
  );
