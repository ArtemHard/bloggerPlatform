import { body } from 'express-validator';
import { LikeStatus } from './types/posts';

export const likeStatusValidation = body('likeStatus')
  .isString()
  .withMessage('likeStatus must be a string')
  .isIn(['None', 'Like', 'Dislike'])
  .withMessage('likeStatus must be one of: None, Like, Dislike');
