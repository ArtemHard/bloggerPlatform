import { Request, Response } from 'express';
import { postsService } from '../../../posts/application/posts.service';
import { errorsHandler } from '../../../../core/errors/errors.handler';
import { PostInputDto } from '../../../posts/dto/post.input-dto';
import { mapToPostViewModel } from '../../../posts/routers/handlers/mappers/map-to-post-view-model';
import { HttpStatus } from '../../../../core/types/http-statuses';

export async function createBlogPostHandler(
  req: Request<{ id: string }, {}, Omit<PostInputDto, 'blogId'>>,
  res: Response,
) {
  try {
    const blogId = req.params.id;

    const response = await postsService.createPostByBlog(req.body, blogId);

    const createdPostOutput = mapToPostViewModel(response);

    res.status(HttpStatus.Created).send(createdPostOutput);
  } catch (e: unknown) {
    errorsHandler(e, res);
  }
}
