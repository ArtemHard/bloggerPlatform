import { NextFunction, Request, Response } from 'express';
import { jwtService } from '../../adapters/jwt.service';
import { IdType } from '../../../core/types/id';
import { container } from '../../../ioc/ioc.container';
import { TYPES } from '../../../ioc/ioc.types';
import { ITokensRepository } from '../../../domain/repositories/types/tokens.repository.interface';

declare global {
  namespace Express {
    interface Request {
      refreshToken?: string;
    }
  }
}

const parseCookie = (header: string | undefined, key: string): string | null => {
  if (!header) return null;
  const match = header.match(new RegExp(`(^| )${key}=([^;]+)`));
  return match ? match[2] : null;
};

export const refreshTokenGuard = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = parseCookie(req.headers.cookie, 'refreshToken');

  if (!refreshToken) return res.sendStatus(401);

  // First verify JWT signature and expiration
  const payload = await jwtService.verifyRefreshToken(refreshToken);
  if (!payload) {
    return res.sendStatus(401);
  }

  // Then check if token exists in database and is not revoked
  const tokensRepository = container.get<ITokensRepository>(TYPES.TokensRepository);
  const tokenData = await tokensRepository.findByToken(refreshToken);
  if (!tokenData) {
    return res.sendStatus(401);
  }

  const { userId } = payload;
  req.user = { id: userId } as IdType;
  
  // Store the actual token in request for logout/refresh operations
  (req as any).refreshToken = refreshToken;
  
  next();
};