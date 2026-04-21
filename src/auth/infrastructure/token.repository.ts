import { injectable } from 'inversify';
import { Collection, ObjectId } from 'mongodb';
import { tokensCollection } from '../../db/mongo.db';
import { ITokensRepository } from '../../domain/repositories/types/tokens.repository.interface';

export interface IRefreshTokenDB {
  _id?: ObjectId;
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  isRevoked: boolean;
  deviceId?: string;
}

@injectable()
export class TokensRepository implements ITokensRepository {
  async create(tokenData: Omit<IRefreshTokenDB, '_id'>): Promise<ObjectId> {
    const result = await tokensCollection.insertOne(tokenData);
    return result.insertedId;
  }

  async findByToken(token: string): Promise<IRefreshTokenDB | null> {
    return tokensCollection.findOne({ 
      token, 
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    });
  }

  async revokeToken(token: string): Promise<boolean> {
    const result = await tokensCollection.updateOne(
      { token },
      { $set: { isRevoked: true } }
    );
    return result.matchedCount === 1;
  }

  async revokeAllUserTokens(userId: string): Promise<boolean> {
    const result = await tokensCollection.updateMany(
      { userId },
      { $set: { isRevoked: true } }
    );
    return result.matchedCount > 0;
  }

  async revokeExpiredTokens(): Promise<boolean> {
    const result = await tokensCollection.updateMany(
      { 
        expiresAt: { $lt: new Date() },
        isRevoked: false
      },
      { $set: { isRevoked: true } }
    );
    return result.matchedCount > 0;
  }

  async deleteRevokedTokens(): Promise<boolean> {
    const result = await tokensCollection.deleteMany({
      isRevoked: true
    });
    return result.deletedCount > 0;
  }

  async revokeTokensByUserIdAndDeviceId(userId: string, deviceId: string): Promise<boolean> {
    const result = await tokensCollection.updateMany(
      { userId, deviceId },
      { $set: { isRevoked: true } }
    );
    return result.matchedCount > 0;
  }
}
