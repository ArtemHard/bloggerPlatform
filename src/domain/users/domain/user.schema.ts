import { Schema, model, Model, HydratedDocument } from 'mongoose';
import { randomUUID } from 'crypto';
import { IUserDB } from '../types/user.db.interface';

// Sub-schema for email confirmation
const emailConfirmationSchema = new Schema({
  confirmationCode: { type: String, required: true },
  expirationDate: { type: Date, required: true },
  isConfirmed: { type: Boolean, required: true, default: false },
}, { _id: false });

// Sub-schema for password recovery
const passwordRecoverySchema = new Schema({
  recoveryCode: { type: String, required: true },
  expirationDate: { type: Date, required: true },
  isConfirmed: { type: Boolean, required: true, default: false },
}, { _id: false });

// Main user schema
const userSchema = new Schema<IUserDB>({
  login: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  emailConfirmation: { type: emailConfirmationSchema, required: true },
  passwordRecovery: { type: passwordRecoverySchema, required: true },
});

// Instance methods
userSchema.methods.updatePassword = function(newPasswordHash: string) {
  this.passwordHash = newPasswordHash;
};

userSchema.methods.confirmEmail = function() {
  this.emailConfirmation.isConfirmed = true;
};

userSchema.methods.updateEmailConfirmation = function(code: string, expirationDate: Date) {
  this.emailConfirmation.confirmationCode = code;
  this.emailConfirmation.expirationDate = expirationDate;
};

userSchema.methods.updatePasswordRecovery = function(code: string, expirationDate: Date) {
  this.passwordRecovery.recoveryCode = code;
  this.passwordRecovery.expirationDate = expirationDate;
  this.passwordRecovery.isConfirmed = false;
};

userSchema.methods.confirmPasswordRecovery = function() {
  this.passwordRecovery.isConfirmed = true;
};

// Static methods
userSchema.statics.createUser = function(login: string, email: string, passwordHash: string) {
  const expirationDate = new Date(Date.now() + 60 * 60 * 1000); // +1 hour
  
  return new this({
    login,
    email,
    passwordHash,
    createdAt: new Date(),
    emailConfirmation: {
      confirmationCode: randomUUID(),
      expirationDate,
      isConfirmed: false,
    },
    passwordRecovery: {
      recoveryCode: randomUUID(),
      expirationDate,
      isConfirmed: false,
    },
  });
};

// Type definitions
export type UserDocument = HydratedDocument<IUserDB>;
export type UserModelType = Model<IUserDB> & {
  createUser(login: string, email: string, passwordHash: string): UserDocument;
};

// Create and export the model
export const UserModel = model<IUserDB, UserModelType>('users', userSchema);