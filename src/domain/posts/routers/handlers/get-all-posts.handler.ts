import { Request, Response } from 'express';
import { container } from '../../../../ioc/ioc.container';
import { TYPES } from '../../../../ioc/ioc.types';
import { IPostsRepository } from '../../../repositories/types/posts.repository.interface';

const postsRepository = container.get<IPostsRepository>(TYPES.PostsRepository);
import { PostQueryInput } from '../input/post-query.input';
import { parseQueryParams } from '../../../../core/utils/query-parser.util';
import { mapToPostListPaginatedOutput } from '../../../blog/routers/mappers/map-to-post-list-paginated-output';

export const getAllPostsHandler = async (
  req: Request<{ id: string }, {}, {}, PostQueryInput>,
  res: Response,
) => {
  const queryInput = req.query;

  const { pageNumber, pageSize } = parseQueryParams(queryInput);

  try {
    const { items, totalCount } =
      await postsRepository.findAllPosts(queryInput);

    const viewModels = mapToPostListPaginatedOutput(items, {
      pageNumber,
      pageSize,
      totalCount,
    });

    return res.status(200).send(viewModels);
  } catch (error) {
    return res.status(500).send();
  }
};
