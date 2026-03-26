import jwt from 'jsonwebtoken';
import { appConfig } from '../../common/config/config';

export const jwtService = {
  async createToken(userId: string): Promise<string> {
    const token = jwt.sign({ userId }, appConfig.AC_SECRET, {
      expiresIn: process.env.AC_TIME ? parseInt(process.env.AC_TIME, 10) : 3600,
    });

    const payload = jwt.decode(token);
    console.log('Generated token payload:', payload);

    return token;
  },
  async decodeToken(token: string): Promise<any> {
    try {
      return jwt.decode(token);
    } catch (e: unknown) {
      console.error("Can't decode token", e);
      return null;
    }
  },
  async verifyToken(token: string): Promise<{ userId: string } | null> {
    try {
      const payload = jwt.verify(token, appConfig.AC_SECRET) as {
        userId: string;
      };

      return { userId: payload.userId };
    } catch (error) {
      return null;
    }
  },
};
