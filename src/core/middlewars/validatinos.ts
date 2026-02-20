import { param } from 'express-validator';
 
export const idValidation = param('id')
  // .exists()
  .isString()
  .withMessage('ID must be a string') // Проверка, что это строка
  .isMongoId()
  .withMessage('Incorrect format of ObjectId'); // Проверка на формат ObjectId