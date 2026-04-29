import { Request, Response, Router } from 'express';
import { HttpStatus } from '../../core/types/http-statuses';
import { BlogModel } from '../../domain/blog/domain/blog.schema';
import { PostModel } from '../../domain/posts/domain/post.schema';
import { UserModel } from '../../domain/users/domain/user.schema';
import { CommentModel } from '../../domain/comments/domain/comment.schema';
import { TokenModel } from '../../auth/domain/token.schema';

export const testingRouter = Router({});

testingRouter.delete('/all-data', async (_: Request, res: Response) => {
  //truncate db
  await Promise.all([
    BlogModel.deleteMany(),
    PostModel.deleteMany(),
    UserModel.deleteMany(),
    CommentModel.deleteMany(),
    TokenModel.deleteMany(),
  ]);
  res.sendStatus(HttpStatus.NoContent);
});
