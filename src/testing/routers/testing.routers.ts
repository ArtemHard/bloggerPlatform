import { Request, Response, Router } from 'express';
import { HttpStatus } from '../../core/types/http-statuses';
import { blogsCollection, commentsCollection, postsCollection, usersCollection } from '../../db/mongo.db';

export const testingRouter = Router({});

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
  //truncate db
  await Promise.all([
    blogsCollection.deleteMany(),
    postsCollection.deleteMany(),
    usersCollection.deleteMany(),
    commentsCollection.deleteMany(),
  ]);
  res.sendStatus(HttpStatus.NoContent);
});
