import { body } from 'express-validator';
import { LikeStatus } from '../../domain/comments/enums/like-status.enum';

export const likeInputValidation = body('likeStatus')
  .isString()
  .withMessage('likeStatus must be a string')
  .isIn(Object.values(LikeStatus))
  .withMessage(`likeStatus must be one of: ${Object.values(LikeStatus).join(', ')}`);
