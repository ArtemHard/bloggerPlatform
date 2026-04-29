import { param } from 'express-validator';
 
export const idValidation = param('id')
  // .exists()
  .isString()
  .withMessage('ID must be a string') // Проверка, что это строка
  .isMongoId()
  .withMessage('Incorrect format of ObjectId'); // Проверка на формат ObjectId

export const commentIdValidation = param('commentId')
  // .exists()
  .isString()
  .withMessage('ID must be a string') // Проверка, что это строка
  .isMongoId()
  .withMessage('Incorrect format of ObjectId'); // Проверка на формат ObjectId

export const postIdValidation = param('postId')
  // .exists()
  .isString()
  .withMessage('postId must be a string') // Проверка, что это строка
  .isMongoId()
  .withMessage('Incorrect format of ObjectId for postId'); // Проверка на формат ObjectId