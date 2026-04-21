import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import { requestLogsCollection } from '../../db/mongo.db';
import { IRequestLog } from './types/request-log.interface';
import { IRequestLogsRepository } from './types/request-logs.repository.interface';

@injectable()
export class RequestLogsRepository implements IRequestLogsRepository {
  async addLog(log: IRequestLog): Promise<void> {
    await requestLogsCollection.insertOne(log);
  }

  async countRequestsByFilter(
    IP: string,
    URL: string,
    timeWindowDurationSeconds: number
  ): Promise<number> {
    const dateFrom = new Date(Date.now() - timeWindowDurationSeconds * 1000);
    return requestLogsCollection.countDocuments({
      IP,
      URL,
      date: { $gte: dateFrom }
    });
  }

  async createDevice(deviceData: Omit<IRequestLog, '_id'>): Promise<ObjectId> {
    const result = await requestLogsCollection.insertOne(deviceData);
    return result.insertedId;
  }

  async findByDeviceId(deviceId: string): Promise<IRequestLog | null> {
    return requestLogsCollection.findOne({ deviceId });
  }

  async findByUserId(userId: string): Promise<IRequestLog[]> {
    return requestLogsCollection
      .find({ userId, exp: { $gt: new Date() } })
      .toArray();
  }

  async deleteByDeviceId(deviceId: string): Promise<boolean> {
    const result = await requestLogsCollection.deleteOne({ deviceId });
    return result.deletedCount === 1;
  }

  async deleteAllExcept(userId: string, currentDeviceId: string): Promise<boolean> {
    const result = await requestLogsCollection.deleteMany({
      userId,
      deviceId: { $ne: currentDeviceId }
    });
    return result.deletedCount > 0;
  }

  async updateLastActiveDate(deviceId: string, lastActiveDate: Date, exp: Date): Promise<boolean> {
    const result = await requestLogsCollection.updateOne(
      { deviceId },
      { $set: { date: lastActiveDate, exp } }
    );
    return result.matchedCount === 1;
  }

  async deleteExpired(): Promise<boolean> {
    const result = await requestLogsCollection.deleteMany({
      exp: { $lt: new Date() }
    });
    return result.deletedCount > 0;
  }
}
