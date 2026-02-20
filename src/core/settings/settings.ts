import * as dotenv from 'dotenv';

dotenv.config();

export const SETTINGS = {
  PORT: process.env.PORT || 5001,
  MONGO_URL:
    process.env.MONGODB_URI || 'mongodb://0.0.0.0:27017',
  DB_NAME: process.env.DB_NAME || 'atlas-cyan-tree',
};

