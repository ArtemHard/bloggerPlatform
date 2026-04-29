import { injectable } from 'inversify';
import { ITokensRepository } from '../../domain/repositories/types/tokens.repository.interface';
import { TokenModel, TokenDocument, IRefreshTokenDB } from '../domain/token.schema';

@injectable()
export class TokensRepository implements ITokensRepository {
  async create(tokenData: Omit<IRefreshTokenDB, '_id'>): Promise<string> {
    const newToken = TokenModel.createToken(
      tokenData.userId,
      tokenData.token,
      tokenData.expiresAt,
      tokenData.deviceId
    );
    await newToken.save();
    return newToken._id.toString();
  }

  async findByToken(token: string): Promise<TokenDocument | null> {
    return TokenModel.findOne({ 
      token, 
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    });
  }

  async revokeToken(token: string): Promise<boolean> {
    const result = await TokenModel.updateOne(
      { token },
      { $set: { isRevoked: true } }
    );
    return result.matchedCount === 1;
  }

  async revokeAllUserTokens(userId: string): Promise<boolean> {
    const result = await TokenModel.updateMany(
      { userId },
      { $set: { isRevoked: true } }
    );
    return result.matchedCount > 0;
  }

  async revokeExpiredTokens(): Promise<boolean> {
    const result = await TokenModel.updateMany(
      { 
        expiresAt: { $lt: new Date() },
        isRevoked: false
      },
      { $set: { isRevoked: true } }
    );
    return result.matchedCount > 0;
  }

  async deleteRevokedTokens(): Promise<boolean> {
    const result = await TokenModel.deleteMany({
      isRevoked: true
    });
    return result.deletedCount > 0;
  }

  async revokeTokensByUserIdAndDeviceId(userId: string, deviceId: string): Promise<boolean> {
    const result = await TokenModel.updateMany(
      { userId, deviceId },
      { $set: { isRevoked: true } }
    );
    return result.matchedCount > 0;
  }
}
