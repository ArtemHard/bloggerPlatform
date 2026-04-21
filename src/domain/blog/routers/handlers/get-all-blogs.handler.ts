import { Request, Response } from 'express';
import { BlogQueryInput } from '../input/blog-query.input';
import { container } from '../../../../ioc/ioc.container';
import { TYPES } from '../../../../ioc/ioc.types';
import { BlogService } from '../../application/blog.service';
import { mapToBlogListPaginatedOutput } from '../mappers/map-to-blog-list-paginated-output';
import { parseQueryParams } from '../../../../core/utils/query-parser.util';

const blogService = container.get<BlogService>(TYPES.BlogService);

export const getAllBlogsHandler = async (
  req: Request<{}, {}, {}, BlogQueryInput>,
  res: Response,
) => {
  try {
    //иначе в blogListOut пихает строки, а не числа, и тесты падают
    const { pageNumber, pageSize } = parseQueryParams(req.query);

    const { items, totalCount } = await blogService.findMany(req.query);

    const blogListOut = mapToBlogListPaginatedOutput(items, {
      pageNumber,
      pageSize,
      totalCount,
    });

    return res.status(200).send(blogListOut);
  } catch (error) {
    return res.status(500).send();
  }
};
