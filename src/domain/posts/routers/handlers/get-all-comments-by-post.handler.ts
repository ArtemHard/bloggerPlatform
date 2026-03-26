import { Request, Response } from 'express';
import { CommentsQueryInput, PostQueryInput } from '../input/post-query.input';
import { parseQueryParams } from '../../../../core/utils/query-parser.util';
import { commentsQwRepository } from '../../../comments/infrastructure/comments.query.repository';
import { mapToCommentsListByPostPaginatedOutput } from '../../../blog/routers/mappers/map-to-comments-list-by-post-paginated-output';

export const getAllCommentsByPostHandler = async (
  req: Request<{ id: string }, {}, {}, CommentsQueryInput>,
  res: Response,
) => {
  const queryInput = req.query;

  const { pageNumber, pageSize, sortBy, sortDirection, skip } =
    parseQueryParams(queryInput);

  try {
    const { data, status } = await commentsQwRepository.findAllCommentsInPost({
      postId: req.params.id,
      sortQueryDto: {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        skip,
      },
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
