import { ObjectId } from 'mongodb';
import { IRequestLog } from './request-log.interface';

export interface IRequestLogsRepository {
  addLog(log: IRequestLog): Promise<void>;

  countRequestsByFilter(
    IP: string,
    URL: string,
    timeWindowDurationSeconds: number
  ): Promise<number>;

  createDevice(deviceData: Omit<IRequestLog, '_id'>): Promise<ObjectId>;

  findByDeviceId(deviceId: string): Promise<IRequestLog | null>;

  findByUserId(userId: string): Promise<IRequestLog[]>;

  deleteByDeviceId(deviceId: string): Promise<boolean>;

  deleteAllExcept(userId: string, currentDeviceId: string): Promise<boolean>;

  updateLastActiveDate(deviceId: string, lastActiveDate: Date, exp: Date): Promise<boolean>;

  deleteExpired(): Promise<boolean>;
}
