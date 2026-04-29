import { Schema, model, Model, HydratedDocument } from 'mongoose';

// Token interface
export interface IRefreshTokenDB {
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  isRevoked: boolean;
  deviceId?: string;
}

// Token schema
const tokenSchema = new Schema<IRefreshTokenDB>({
  userId: { type: String, required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  expiresAt: { type: Date, required: true },
  isRevoked: { type: Boolean, required: true, default: false },
  deviceId: { type: String, required: false },
});

// Static methods
tokenSchema.statics.createToken = function(
  userId: string,
  token: string,
  expiresAt: Date,
  deviceId?: string
) {
  const createdAt = new Date();
  
  return new this({
    userId,
    token,
    createdAt,
    expiresAt,
    isRevoked: false,
    deviceId,
  });
};

// Instance methods
tokenSchema.methods.revoke = function() {
  this.isRevoked = true;
  return this.save();
};

tokenSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

tokenSchema.methods.isValid = function() {
  return !this.isRevoked && !this.isExpired();
};

// Type definitions
export type TokenDocument = HydratedDocument<IRefreshTokenDB>;
export type TokenModelType = Model<IRefreshTokenDB> & {
  createToken(userId: string, token: string, expiresAt: Date, deviceId?: string): TokenDocument;
};

// Create and export the model
export const TokenModel = model<IRefreshTokenDB, TokenModelType>('tokens', tokenSchema);
