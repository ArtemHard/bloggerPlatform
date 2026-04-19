import { PromiseResult } from '../../common/result/result.type';
import { ResultStatus } from '../../common/result/resultCode';
import { securityQwRepository } from '../infrastructure/security.query.repository';
import { requestLogsRepository } from '../../domain/repositories/request-logs.repository';
import { tokensRepository } from '../infrastructure/token.repository';

export const securityService = {
  async getAllDevices(userId: string): Promise<PromiseResult<any>> {
    const devices = await securityQwRepository.findAllByUserId(userId);

    return {
      status: ResultStatus.Success,
      data: devices,
      extensions: [],
    };
  },

  async deleteAllOtherDevices(userId: string, currentDeviceId: string): Promise<PromiseResult<null>> {
    const devices = await requestLogsRepository.findByUserId(userId);

    for (const device of devices) {
      if (device.deviceId && device.deviceId !== currentDeviceId) {
        await requestLogsRepository.deleteByDeviceId(device.deviceId);
        await tokensRepository.revokeTokensByUserIdAndDeviceId(userId, device.deviceId);
      }
    }

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  },

  async deleteDevice(userId: string, deviceId: string): Promise<PromiseResult<null>> {
    const device = await requestLogsRepository.findByDeviceId(deviceId);

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

    await requestLogsRepository.deleteByDeviceId(deviceId);
    await tokensRepository.revokeTokensByUserIdAndDeviceId(userId, deviceId);

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  },
};
