import { Request, Response } from 'express';
import { PostQueryInput } from '../../../posts/routers/input/post-query.input';
import { postsService } from '../../../posts/application/posts.service';
import { mapToPostListPaginatedOutput } from '../mappers/map-to-post-list-paginated-output';
import { errorsHandler } from '../../../../core/errors/errors.handler';
import { parseQueryParams } from '../../../../core/utils/query-parser.util';

export async function getBlogPostsListHandler(
  req: Request<{ id: string }, {}, {}, PostQueryInput>,
  res: Response,
) {
  try {
    const blogId = req.params.id;
    const queryInput = req.query;

    const { items, totalCount } = await postsService.findPostsByBlog(
      queryInput,
      blogId,
    );

    const { pageNumber, pageSize } = parseQueryParams(queryInput);

    const postListOutput = mapToPostListPaginatedOutput(items, {
      pageNumber,
      pageSize,
      totalCount,
    });

    res.send(postListOutput);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
