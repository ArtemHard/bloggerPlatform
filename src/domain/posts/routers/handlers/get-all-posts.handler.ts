import { Request, Response } from 'express';
import { container } from '../../../../ioc/ioc.container';
import { TYPES } from '../../../../ioc/ioc.types';
import { IPostsRepository } from '../../../repositories/types/posts.repository.interface';

const postsRepository = container.get<IPostsRepository>(TYPES.PostsRepository);
import { PostQueryInput } from '../input/post-query.input';
import { PostSortField } from '../input/post-sort-field';
import { SortDirection } from '../../../../core/types/sort-direction';
import { mapToPostListPaginatedOutput } from '../../../blog/routers/mappers/map-to-post-list-paginated-output';
import { parseQueryParams } from '../../../../core/utils/query-parser.util';

export const getAllPostsHandler = async (
  req: Request,
  res: Response,
) => {
  // Парсим query параметры
  const { pageNumber, pageSize, sortBy, sortDirection } = parseQueryParams(req.query);
  
  const query: PostQueryInput = {
    pageNumber,
    pageSize,
    sortBy: sortBy as PostSortField,
    sortDirection: sortDirection === 1 ? SortDirection.Asc : SortDirection.Desc
  };
  
  const userId = req.user?.id;

  try {
    // Получаем посты
    const { items, totalCount } =
      await postsRepository.findAllPosts(query, userId);

    // Используем правильный маппинг с likes info
    const viewModels = mapToPostListPaginatedOutput(items, {
      pageNumber,
      pageSize,
      totalCount,
    });

    return res.status(200).send(viewModels);
  } catch (error) {
    console.error('Error in getAllPostsHandler:', error);
    return res.status(500).send();
  }
};
