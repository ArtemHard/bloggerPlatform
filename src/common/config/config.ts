import { config } from 'dotenv';

config();

export const appConfig = {
//   PORT: process.env.PORT,
  MONGO_URL: process.env.MONGODB_URI as string,
//   DB_NAME: process.env.DB_NAME as string,
  AC_SECRET: process.env.AC_SECRET as string,
  AC_TIME: process.env.AC_TIME as unknown as number,
//   RT_SECRET: process.env.RT_SECRET,
//   DB_TYPE: process.env.DB_TYPE,
//   EMAIL: process.env.EMAIL as string,
//   EMAIL_PASS: process.env.EMAIL_PASS as string,
};
