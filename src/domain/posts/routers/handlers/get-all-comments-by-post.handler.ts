import { Request, Response } from 'express';
import { CommentsQueryInput } from '../input/post-query.input';
import { parseQueryParams } from '../../../../core/utils/query-parser.util';
import { container } from '../../../../ioc/ioc.container';
import { TYPES } from '../../../../ioc/ioc.types';
import { ICommentsQueryRepository } from '../../../repositories/types/comments.query.repository.interface';
import { mapToCommentsListByPostPaginatedOutput } from '../../../blog/routers/mappers/map-to-comments-list-by-post-paginated-output';

const commentsQwRepository = container.get<ICommentsQueryRepository>(TYPES.CommentsQueryRepository);

export const getAllCommentsByPostHandler = async (
  req: Request<{ id: string }, {}, {}, CommentsQueryInput>,
  res: Response,
) => {
  const queryInput = req.query;

  const { pageNumber, pageSize, sortBy, sortDirection, skip } =
    parseQueryParams(queryInput);

  try {
    const currentUserId = req.user?.id; // Получаем ID текущего пользователя
    const { data, status } = await commentsQwRepository.findAllCommentsInPost({
      postId: req.params.id,
      sortQueryDto: {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        skip,
      },
      currentUserId,
    });

    if (status === 'NotFound') {
      return res.status(404).send();
    }

    const viewModels = mapToCommentsListByPostPaginatedOutput(data.items, {
      pageNumber,
      pageSize,
      totalCount: data?.totalCount,
    });

    return res.status(200).send(viewModels);
  } catch (error) {
    return res.status(500).send();
  }
};
