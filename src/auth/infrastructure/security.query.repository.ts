import { inject, injectable } from 'inversify';
import { TYPES } from '../../ioc/ioc.types';
import { IRequestLogsRepository } from '../../domain/repositories/types/request-logs.repository.interface';
import { ISecurityQueryRepository } from '../../domain/repositories/types/security-query.repository.interface';
import { IDeviceView } from '../types/security.types';
import { IRequestLog } from '../../domain/repositories/types/request-log.interface';

@injectable()
export class SecurityQueryRepository implements ISecurityQueryRepository {
  @inject(TYPES.RequestLogsRepository) private requestLogsRepository!: IRequestLogsRepository;

  async findAllByUserId(userId: string): Promise<IDeviceView[]> {
    const devices = await this.requestLogsRepository.findByUserId(userId);
    return devices.map((device) => this._mapToView(device));
  }

  private _mapToView(device: IRequestLog): IDeviceView {
    return {
      deviceId: device.deviceId || '',
      ip: device.IP,
      lastActiveDate: device.date.toISOString(),
      title: device.title || 'Unknown Device',
    };
  }
}
