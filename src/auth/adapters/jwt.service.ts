import jwt from 'jsonwebtoken';
import { appConfig } from '../../common/config/config';

export const jwtService = {
  async createAccessToken(userId: string): Promise<string> {
    const token = jwt.sign({ userId }, appConfig.AC_SECRET, {
      expiresIn: process.env.AC_TIME ? parseInt(process.env.AC_TIME, 10) : 10,
    });

    return token;
  },
  async createRefreshToken(userId: string, deviceId: string): Promise<string> {
    const token = jwt.sign({ userId, deviceId }, appConfig.RT_SECRET, {
      expiresIn: process.env.RT_TIME ? parseInt(process.env.RT_TIME, 10) : 20,
    });

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
  async verifyAccessToken(token: string): Promise<{ userId: string } | null> {
    try {
      const payload = jwt.verify(token, appConfig.AC_SECRET) as {
        userId: string;
      };

      return { userId: payload.userId };
    } catch (error) {
      return null;
    }
  },
  async verifyRefreshToken(token: string): Promise<{ userId: string; deviceId: string } | null> {
    try {
      const payload = jwt.verify(token, appConfig.RT_SECRET) as {
        userId: string;
        deviceId: string;
      };

      return { userId: payload.userId, deviceId: payload.deviceId };
    } catch (error) {
      return null;
    }
  },
  async decodeRefreshToken(token: string): Promise<{ userId: string; deviceId: string } | null> {
    try {
      const payload = jwt.decode(token) as { userId: string; deviceId: string };
      if (!payload || !payload.userId || !payload.deviceId) {
        return null;
      }
      return { userId: payload.userId, deviceId: payload.deviceId };
    } catch (e: unknown) {
      console.error("Can't decode refresh token", e);
      return null;
    }
  },
};
