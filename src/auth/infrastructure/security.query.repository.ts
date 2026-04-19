import { requestLogsRepository } from '../../domain/repositories/request-logs.repository';
import { IDeviceView } from '../types/security.types';
import { IRequestLog } from '../../domain/repositories/types/request-log.interface';

export const securityQwRepository = {
  async findAllByUserId(userId: string): Promise<IDeviceView[]> {
    const devices = await requestLogsRepository.findByUserId(userId);
    return devices.map((device) => this._mapToView(device));
  },

  _mapToView(device: IRequestLog): IDeviceView {
    return {
      deviceId: device.deviceId || '',
      ip: device.IP,
      lastActiveDate: device.date.toISOString(),
      title: device.title || 'Unknown Device',
    };
  },
};
