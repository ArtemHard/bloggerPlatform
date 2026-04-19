import { Collection, Db, MongoClient, MongoClientOptions } from 'mongodb';
import { attachDatabasePool } from '@vercel/functions';
import { SETTINGS } from '../core/settings/settings';
import { Blog } from '../domain/blog/validation/types/blog';
import { Post } from '../domain/blog/validation/types/posts';
import { IUserDB } from '../domain/users/types/user.db.interface';
import { ICommentDB } from '../domain/comments/types/comment.db.interface';
import { IRefreshTokenDB } from '../auth/infrastructure/token.repository';
import { IRequestLog } from '../domain/repositories/types/request-log.interface';

const BLOG_COLLECTION_NAME = 'blog';
const POSTS_COLLECTION_NAME = 'posts';
const USERS_COLLECTION_NAME = 'users';
const COMMENTS_COLLECTION_NAME = 'comments';
const TOKENS_COLLECTION_NAME = 'tokens';
const REQUEST_LOGS_COLLECTION_NAME = 'request_logs';

export let client: MongoClient;
export let blogsCollection: Collection<Blog>;
export let postsCollection: Collection<Post>;
export let usersCollection: Collection<IUserDB>;
export let commentsCollection: Collection<ICommentDB>;
export let tokensCollection: Collection<IRefreshTokenDB>;
export let requestLogsCollection: Collection<IRequestLog>;

const options: MongoClientOptions = {
  appName: 'devrel.vercel.integration',
  maxIdleTimeMS: 5000,
};

// Подключения к бд
export async function runDB(url: string): Promise<void> {
  client = new MongoClient(url, options);
  const db: Db = client.db(SETTINGS.DB_NAME);

  //Initialization of collections
  blogsCollection = db.collection<Blog>(BLOG_COLLECTION_NAME);
  postsCollection = db.collection<Post>(POSTS_COLLECTION_NAME);
  usersCollection = db.collection<IUserDB>(USERS_COLLECTION_NAME);
  commentsCollection = db.collection<ICommentDB>(COMMENTS_COLLECTION_NAME);
  tokensCollection = db.collection<IRefreshTokenDB>(TOKENS_COLLECTION_NAME);
  requestLogsCollection = db.collection<IRequestLog>(REQUEST_LOGS_COLLECTION_NAME);

  attachDatabasePool(client);

  try {
    await client.connect();
    await db.command({ ping: 1 });
    console.log('✅ Connected to the database');
  } catch (e) {
    await client.close();
    throw new Error(`❌ Database not connected: ${e}`);
  }
}

export async function stopDb() {
  if (!client) {
    throw new Error(`❌ No active client`);
  }
  await client.close();
}
