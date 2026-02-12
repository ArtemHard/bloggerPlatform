// import { isValidISODateString } from '../../core/validation/date.validation';
// import { VideoInputDto } from '../dto/video.input-dto';
// import { ValidationError } from './types/validationErrors';
// import { Resolution, Video } from './types/video';
// import { videoInputDtoValidation } from './blogInputDtoValidation';

// export const videoInputUpdateDtoValidation = (
//   data: Video,
// ): ValidationError[] => {
//   const { author, availableResolutions, title } = data;
//   const errors: ValidationError[] = [
//     ...videoInputDtoValidation({ author, availableResolutions, title }),
//   ];

//   if (!data.canBeDownloaded || typeof data.canBeDownloaded !== 'boolean') {
//     errors.push({
//       message: 'canBeDownloaded must be a boolean',
//       field: 'canBeDownloaded',
//     });
//   }

//   if (!data.publicationDate || !isValidISODateString(data.publicationDate)) {
//     errors.push({
//       field: 'publicationDate',
//       message:
//         'publicationDate must be a valid ISO 8601 date-time string in UTC (e.g. 2026-02-03T12:52:34.969Z)',
//     });
//   }

//   if (
//     data.minAgeRestriction !== null &&
//     (typeof data.minAgeRestriction !== 'number' ||
//       !Number.isInteger(data.minAgeRestriction) ||
//       data.minAgeRestriction < 1 ||
//       data.minAgeRestriction > 18)
//   ) {
//     errors.push({
//       field: 'minAgeRestriction',
//       message: 'minAgeRestriction must be an integer between 1 and 18, or null',
//     });
//   }

//   return errors;
// };
