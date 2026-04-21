import { IDeviceView } from '../../../auth/types/security.types';

export interface ISecurityQueryRepository {
  findAllByUserId(userId: string): Promise<IDeviceView[]>;
}
