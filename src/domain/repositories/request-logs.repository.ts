import { injectable } from 'inversify';
import { IRequestLog } from './types/request-log.interface';
import { IRequestLogsRepository } from './types/request-logs.repository.interface';
import { Schema, model, HydratedDocument } from 'mongoose';

// Request log schema
const requestLogSchema = new Schema<IRequestLog>({
  IP: { type: String, required: true },
  URL: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  userId: { type: String, required: false },
  deviceId: { type: String, required: false },
  title: { type: String, required: false },
  exp: { type: Date, required: false },
});

// Type definitions
export type RequestLogDocument = HydratedDocument<IRequestLog>;

// Create and export the model
const RequestLogModel = model<IRequestLog>('request_logs', requestLogSchema);

@injectable()
export class RequestLogsRepository implements IRequestLogsRepository {
  async addLog(log: IRequestLog): Promise<void> {
    const newLog = new RequestLogModel(log);
    await newLog.save();
  }

  async countRequestsByFilter(
    IP: string,
    URL: string,
    timeWindowDurationSeconds: number
  ): Promise<number> {
    const dateFrom = new Date(Date.now() - timeWindowDurationSeconds * 1000);
    return RequestLogModel.countDocuments({
      IP,
      URL,
      date: { $gte: dateFrom }
    });
  }

  async createDevice(deviceData: Omit<IRequestLog, '_id'>): Promise<string> {
    const newLog = new RequestLogModel(deviceData);
    await newLog.save();
    return newLog._id.toString();
  }

  async findByDeviceId(deviceId: string): Promise<IRequestLog | null> {
    return RequestLogModel.findOne({ deviceId });
  }

  async findByUserId(userId: string): Promise<IRequestLog[]> {
    return RequestLogModel.find({ userId });
  }

  async deleteByDeviceId(deviceId: string): Promise<boolean> {
    const result = await RequestLogModel.deleteOne({ deviceId });
    return result.deletedCount > 0;
  }

  async deleteAllExcept(userId: string, currentDeviceId: string): Promise<boolean> {
    const result = await RequestLogModel.deleteMany({
      userId,
      deviceId: { $ne: currentDeviceId }
    });
    return result.deletedCount > 0;
  }

  async updateLastActiveDate(deviceId: string, lastActiveDate: Date, exp: Date): Promise<boolean> {
    const result = await RequestLogModel.updateOne(
      { deviceId },
      { $set: { date: lastActiveDate, exp } }
    );
    return result.matchedCount === 1;
  }

  async deleteExpired(): Promise<boolean> {
    const result = await RequestLogModel.deleteMany({
      exp: { $lt: new Date() }
    });
    return result.deletedCount > 0;
  }
}
