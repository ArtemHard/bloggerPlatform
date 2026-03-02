import { Request, Response } from 'express';
import { BlogQueryInput } from '../input/blog-query.input';
import { blogService } from '../../application/blog.service';
import { mapToBlogListPaginatedOutput } from '../mappers/map-to-blog-list-paginated-output';

export const getAllBlogsHandler = async (
  req: Request<{}, {}, {}, BlogQueryInput>,
  res: Response,
) => {
  try {
    const { items, totalCount } = await blogService.findMany(req.query);

    const blogListOut = mapToBlogListPaginatedOutput(items, {
      pageNumber: req.query.pageNumber || 1,
      pageSize: req.query.pageSize || 10,
      totalCount,
    });

    return res.status(200).send(blogListOut);
  } catch (error) {
    return res.status(500).send();
  }
};
