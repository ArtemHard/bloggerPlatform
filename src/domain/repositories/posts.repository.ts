import { PostInputDto } from '../posts/dto/post.input-dto';
import { Post } from '../blog/validation/types/posts';
import { ObjectId, WithId } from 'mongodb';
import { blogsCollection, postsCollection } from '../../db/mongo.db';
import { PostQueryInput } from '../posts/routers/input/post-query.input';
import { findPaginated } from '../../core/utils/pagination.util';

export const postsRepository = {
  // Найти все posts
  async findAllPosts(
    queryDto: PostQueryInput,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    return findPaginated<Post>(postsCollection, {}, queryDto);
  },

  async findMany(
    queryDto: PostQueryInput,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;
    const filter = {};
    const skip = (pageNumber - 1) * pageSize;

    const [items, totalCount] = await Promise.all([
      postsCollection
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      postsCollection.countDocuments(filter),
    ]);
    return { items, totalCount };
  },

  async findPostsByBlog(
    queryDto: PostQueryInput,
    blogId: string,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    return findPaginated<Post>(postsCollection, { blogId }, queryDto);
  },

  async findById(id: string): Promise<WithId<Post> | null> {
    return postsCollection.findOne({ _id: new ObjectId(id) });
  },

  async findByIdOrFail(id: string): Promise<WithId<Post>> {
    const res = await postsCollection.findOne({ _id: new ObjectId(id) });

    if (!res) {
      throw new Error('Post not found');
      // throw new RepositoryNotFoundError('Post not exist');
    }
    return res;
  },

  // Создать новый post
  async create(dto: PostInputDto): Promise<WithId<Post>> {
    const createdAt = new Date().toISOString();
    const blogName =
      (await blogsCollection.findOne({ _id: new ObjectId(dto.blogId) }))
        ?.name || 'Unknown Blog';

    const newPost: Post = {
      ...dto,
      blogName,
      createdAt,
    };

    const insertResult = await postsCollection.insertOne(newPost);
    return { ...newPost, _id: insertResult.insertedId };
  },

  // Обновить post по ID
  async update(
    id: string,
    { title, shortDescription, content, blogId }: PostInputDto,
  ): Promise<void> {
    const blogName =
      (await blogsCollection.findOne({ _id: new ObjectId(blogId) }))?.name ||
      'Unknown Blog';

    const updateResult = await postsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          shortDescription,
          content,
          blogId,
          blogName,
        },
      },
    );

    if (updateResult.matchedCount < 1) {
      throw new Error('Post not found');
    }
    return;
  },

  // Удалить post по ID
  async delete(id: string): Promise<void> {
    const deleteResult = await postsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      throw new Error('Post not found');
    }

    return;
  },
};
