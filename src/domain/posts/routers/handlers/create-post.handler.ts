import { Request, Response } from 'express';
import { PostInputDto } from '../../dto/post.input-dto';
import { postInputDtoValidation } from '../../validation/postInputDtoValidation';
import { HttpStatus } from '../../../../core/types/http-statuses';
import { createErrorMessages } from '../../../../core/middlewars/input-validtion-result.middleware';
import { container } from '../../../../ioc/ioc.container';
import { TYPES } from '../../../../ioc/ioc.types';
import { IPostsRepository } from '../../../repositories/types/posts.repository.interface';

const postsRepository = container.get<IPostsRepository>(TYPES.PostsRepository);
import { mapToPostViewModel } from './mappers/map-to-post-view-model';

export const createPostHandler = async (
  req: Request<{}, {}, PostInputDto>,
  res: Response,
) => {
  const attributes = req.body;

  const errors = postInputDtoValidation(attributes);

  if (errors.length > 0) {
    return res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
  }

  try {
    const createdPost = await postsRepository.create(attributes);
    return res.status(HttpStatus.Created).send(mapToPostViewModel(createdPost));
  } catch (error) {
    return res.status(HttpStatus.InternalServerError).send();
  }
};
