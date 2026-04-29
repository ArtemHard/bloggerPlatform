import { Request, Response } from 'express';
import { PostQueryInput } from '../../../posts/routers/input/post-query.input';
import { container } from '../../../../ioc/ioc.container';
import { TYPES } from '../../../../ioc/ioc.types';
import { PostsService } from '../../../posts/application/posts.service';
import { PostLike } from '../../../posts/validation/types/posts';

const postsService = container.get<PostsService>(TYPES.PostsService);
import { mapToPostListPaginatedOutput } from '../mappers/map-to-post-list-paginated-output';
import { errorsHandler } from '../../../../core/errors/errors.handler';
import { parseQueryParams } from '../../../../core/utils/query-parser.util';

export async function getBlogPostsListHandler(
  req: Request,
  res: Response,
) {
  try {
    const blogId = req.params.id as string;
    const queryInput = req.query as unknown as PostQueryInput;
    const userId = req.user?.id; // Получаем userId из req.user

    // Парсим query параметры для получения корректных значений
    const parsedQuery = parseQueryParams(queryInput);
    
    // Создаем правильный PostQueryInput
    const postQueryInput: PostQueryInput = {
      pageNumber: parsedQuery.pageNumber,
      pageSize: parsedQuery.pageSize,
      sortBy: parsedQuery.sortBy as any, // Временно приводим к any
      sortDirection: parsedQuery.sortDirection as any,
    };
    
    const { items, totalCount } = await postsService.findPostsByBlog(
      postQueryInput,
      blogId,
      userId, // Передаем userId
    );

    const postListOutput = mapToPostListPaginatedOutput(items, {
      pageNumber: parsedQuery.pageNumber,
      pageSize: parsedQuery.pageSize,
      totalCount,
    });

    res.send(postListOutput);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
