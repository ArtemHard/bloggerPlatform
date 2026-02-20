import { PostInputDto } from '../posts/dto/post.input-dto';
import { Post } from '../blog/validation/types/posts';
import { ObjectId, WithId } from 'mongodb';
import { blogsCollection, postsCollection } from '../../db/mongo.db';

export const postsRepository = {
  // Найти все posts
  async findAllPosts(): Promise<WithId<Post>[]> {
    return postsCollection.find().toArray();
  },

  // Найти post по ID
  async findById(id: string): Promise<WithId<Post> | null> {
    try {
      return await postsCollection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      return null;
    }
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
