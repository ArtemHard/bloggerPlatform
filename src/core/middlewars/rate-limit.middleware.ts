import { NextFunction, Request, Response } from 'express';
import { container } from '../../ioc/ioc.container';
import { TYPES } from '../../ioc/ioc.types';
import { IRequestLogsRepository } from '../../domain/repositories/types/request-logs.repository.interface';
import { getRequestIp } from '../../core/utils/getRequestIp';

export const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestLogsRepository = container.get<IRequestLogsRepository>(TYPES.RequestLogsRepository);
  const ip = getRequestIp(req);
  const url = req.originalUrl;
  const attemptsLimit = 5;
  const timeWindowDurationSeconds = 10;

  try {
    await requestLogsRepository.addLog({
      IP: ip,
      URL: url,
      date: new Date()
    });

    const requestCount = await requestLogsRepository.countRequestsByFilter(
      ip,
      url,
      timeWindowDurationSeconds
    );

    if (requestCount > attemptsLimit) {
      return res.sendStatus(429);
    }

    next();
  } catch (error) {
    console.error('Rate limiting middleware error:', error);
    next();
  }
};
