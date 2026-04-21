import { ObjectId } from 'mongodb';

export interface IRefreshTokenDB {
  _id?: ObjectId;
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  isRevoked: boolean;
  deviceId?: string;
}

export interface ITokensRepository {
  create(tokenData: Omit<IRefreshTokenDB, '_id'>): Promise<ObjectId>;

  findByToken(token: string): Promise<IRefreshTokenDB | null>;

  revokeToken(token: string): Promise<boolean>;

  revokeAllUserTokens(userId: string): Promise<boolean>;

  revokeExpiredTokens(): Promise<boolean>;

  deleteRevokedTokens(): Promise<boolean>;

  revokeTokensByUserIdAndDeviceId(userId: string, deviceId: string): Promise<boolean>;
}
