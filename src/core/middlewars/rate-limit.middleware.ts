import { NextFunction, Request, Response } from 'express';
import { requestLogsRepository } from '../../domain/repositories/request-logs.repository';
import { getRequestIp } from '../../core/utils/getRequestIp';

export const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
