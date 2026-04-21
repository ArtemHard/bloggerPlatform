import { inject, injectable } from 'inversify';
import { PromiseResult } from '../../common/result/result.type';
import { ResultStatus } from '../../common/result/resultCode';
import { TYPES } from '../../ioc/ioc.types';
import { ISecurityQueryRepository } from '../../domain/repositories/types/security-query.repository.interface';
import { IRequestLogsRepository } from '../../domain/repositories/types/request-logs.repository.interface';
import { ITokensRepository } from '../../domain/repositories/types/tokens.repository.interface';

@injectable()
export class SecurityService {
  @inject(TYPES.SecurityQueryRepository) private securityQwRepository!: ISecurityQueryRepository;
  @inject(TYPES.RequestLogsRepository) private requestLogsRepository!: IRequestLogsRepository;
  @inject(TYPES.TokensRepository) private tokensRepository!: ITokensRepository;

  constructor() {}

  async getAllDevices(userId: string): Promise<PromiseResult<any>> {
    const devices = await this.securityQwRepository.findAllByUserId(userId);

    return {
      status: ResultStatus.Success,
      data: devices,
      extensions: [],
    };
  }

  async deleteAllOtherDevices(userId: string, currentDeviceId: string): Promise<PromiseResult<null>> {
    const devices = await this.requestLogsRepository.findByUserId(userId);

    for (const device of devices) {
      if (device.deviceId && device.deviceId !== currentDeviceId) {
        await this.requestLogsRepository.deleteByDeviceId(device.deviceId);
        await this.tokensRepository.revokeTokensByUserIdAndDeviceId(userId, device.deviceId);
      }
    }

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  }

  async deleteDevice(userId: string, deviceId: string): Promise<PromiseResult<null>> {
    const device = await this.requestLogsRepository.findByDeviceId(deviceId);

    if (!device) {
      return {
        status: ResultStatus.NotFound,
        data: null,
        errorMessage: 'Device not found',
        extensions: [],
      };
    }

    if (device.userId !== userId) {
      return {
        status: ResultStatus.Forbidden,
        data: null,
        errorMessage: 'Forbidden',
        extensions: [],
      };
    }

    await this.requestLogsRepository.deleteByDeviceId(deviceId);
    await this.tokensRepository.revokeTokensByUserIdAndDeviceId(userId, deviceId);

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  }
}
