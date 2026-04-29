import { NextFunction, Request, Response } from 'express';
import { jwtService } from '../../adapters/jwt.service';
import { IdType } from '../../../core/types/id';

export const optionalAccessTokenGuard = async (req: Request, _: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    next(); // Продолжаем без пользователя
    return;
  }

  const parts = req.headers.authorization.split(' ');
  if (parts.length !== 2) {
    next(); // Продолжаем без пользователя
    return;
  }
  const [authType, token] = parts;
  
  if (authType !== 'Bearer') {
    next(); // Продолжаем без пользователя
    return;
  }

  const payload = await jwtService.verifyAccessToken(token);
  if (payload) {
    const { userId } = payload;
    req.user = { id: userId } as IdType;
  }

  next(); // Всегда продолжаем
};
