import { Request, Response } from 'express';
import { container } from '../../../../ioc/ioc.container';
import { TYPES } from '../../../../ioc/ioc.types';
import { IPostsRepository } from '../../../repositories/types/posts.repository.interface';

const postsRepository = container.get<IPostsRepository>(TYPES.PostsRepository);
import { PostQueryInput } from '../input/post-query.input';
import { PostSortField } from '../input/post-sort-field';
import { SortDirection } from '../../../../core/types/sort-direction';
import { mapToPostListPaginatedOutput } from '../../../blog/routers/mappers/map-to-post-list-paginated-output';

export const getAllPostsHandler = async (
  req: Request,
  res: Response,
) => {
  // Временно используем жестко заданные параметры для диагностики
  const hardcodedQuery: PostQueryInput = {
    pageNumber: 1,
    pageSize: 10,
    sortBy: PostSortField.createdAt,
    sortDirection: SortDirection.Desc
  };
  const userId = req.user?.id;

  try {
    // Получаем посты без маппинга лайков для начала
    const { items, totalCount } =
      await postsRepository.findAllPosts(hardcodedQuery, userId);

    // Используем правильный маппинг с likes info
    const viewModels = mapToPostListPaginatedOutput(items, {
      pageNumber: hardcodedQuery.pageNumber,
      pageSize: hardcodedQuery.pageSize,
      totalCount: totalCount,
    });

    return res.status(200).send(viewModels);
  } catch (error) {
    console.error('Error in getAllPostsHandler:', error);
    return res.status(500).send();
  }
};
