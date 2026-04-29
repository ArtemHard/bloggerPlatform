import { TokenDocument, IRefreshTokenDB } from '../../../auth/domain/token.schema';

export interface ITokensRepository {
  create(tokenData: Omit<IRefreshTokenDB, '_id'>): Promise<string>;

  findByToken(token: string): Promise<TokenDocument | null>;

  revokeToken(token: string): Promise<boolean>;

  revokeAllUserTokens(userId: string): Promise<boolean>;

  revokeExpiredTokens(): Promise<boolean>;

  deleteRevokedTokens(): Promise<boolean>;

  revokeTokensByUserIdAndDeviceId(userId: string, deviceId: string): Promise<boolean>;
}
