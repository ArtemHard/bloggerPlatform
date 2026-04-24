import { z } from 'zod';
import { LikeStatus } from '../../enums/like-status.enum';

export const likeSchema = z.object({
  likeStatus: z.nativeEnum(LikeStatus, {
    message: `likeStatus must be one of: ${Object.values(LikeStatus).join(', ')}`,
  }),
});
