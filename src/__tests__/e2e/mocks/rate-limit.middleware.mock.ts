import { NextFunction, Request, Response } from 'express';

// Mock rate limiting middleware that bypasses rate limiting for tests
export const mockRateLimitMiddleware = async (
  _: Request,
  __: Response,
  next: NextFunction,
) => {
  // In tests, we always bypass rate limiting
  next();
};
