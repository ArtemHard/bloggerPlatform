import { Request } from 'express';

export const getRequestIp = (req: Request): string => {
  return req.ip || req.socket.remoteAddress || req.connection.remoteAddress || 'unknown';
};
