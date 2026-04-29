import { injectable } from 'inversify';
import { PostInputDto } from '../posts/dto/post.input-dto';
import { Post } from '../posts/validation/types/posts';
import { ObjectId, WithId } from 'mongodb';
import { blogsCollection, postsCollection, usersCollection } from '../../db/mongo.db';
import { PostQueryInput } from '../posts/routers/input/post-query.input';
import { IPostsRepository } from './types/posts.repository.interface';
import { LikeStatus, PostLike } from '../posts/validation/types/posts';

@injectable()
export class PostsRepository implements IPostsRepository {
  // Найти все posts
  async findAllPosts(
    queryDto: PostQueryInput,
    userId?: string, // Добавляем параметр userId
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;
    const skip = (pageNumber - 1) * pageSize;

    try {
      const items = await postsCollection
        .find({})
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(pageSize)
        .toArray();
      
      const totalCount = await postsCollection.countDocuments({});
      
      // Маппим посты с информацией о лайках, передавая userId
    const mappedItems = items.map(post => this.mapPostWithLikesInfo(post, userId));
    
    return { items: mappedItems, totalCount };
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async findMany(
    queryDto: PostQueryInput,
    userId?: string, // Добавляем параметр userId
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;
    const filter: any = {};
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
    
    // Маппим посты с информацией о лайках, передавая userId
    const mappedItems = items.map(post => this.mapPostWithLikesInfo(post, userId));
    
    return { items: mappedItems, totalCount };
  }

  async findPostsByBlog(
    queryDto: PostQueryInput,
    blogId: string,
    userId?: string, // Добавляем параметр userId
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;
    const skip = (pageNumber - 1) * pageSize;

    const [items, totalCount] = await Promise.all([
      postsCollection
        .find({ blogId })
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      postsCollection.countDocuments({ blogId }),
    ]);
    
    // Маппим посты с информацией о лайках, передавая userId
    const mappedItems = items.map(post => this.mapPostWithLikesInfo(post, userId));
    
    return { items: mappedItems, totalCount };
  }

  async findById(id: string): Promise<WithId<Post> | null> {
    try {
      const post = await postsCollection.findOne({ _id: new ObjectId(id) });
      if (!post) return null;
      
      // Возвращаем пост с вычисленным extendedLikesInfo
      return this.mapPostWithLikesInfo(post);
    } catch (error) {
      return null;
    }
  }

  // Метод для получения поста с информацией о лайках для конкретного пользователя
  async findByIdWithUserInfo(id: string, userId?: string): Promise<WithId<Post> | null> {
    try {
      const post = await postsCollection.findOne({ _id: new ObjectId(id) });
      if (!post) return null;
      
      return this.mapPostWithLikesInfo(post, userId);
    } catch (error) {
      return null;
    }
  }

  async findByIdOrFail(id: string): Promise<WithId<Post>> {
    const res = await postsCollection.findOne({ _id: new ObjectId(id) });

    if (!res) {
      throw new Error('Post not found');
      // throw new RepositoryNotFoundError('Post not exist');
    }
    return res;
  }

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
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: []
      }
    };

    const insertResult = await postsCollection.insertOne(newPost);
    return { ...newPost, _id: insertResult.insertedId };
  }

  // Обновить post по ID
  async update(
    id: string,
    { title, shortDescription, content, blogId }: PostInputDto,
  ): Promise<void> {
    const blogName =
      (await blogsCollection.findOne({ _id: new ObjectId(blogId) }))?.name ||
      'Unknown Blog';

    const existingPost = await this.findByIdOrFail(id);
    
    const updateResult = await postsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          shortDescription,
          content,
          blogId,
          blogName,
          extendedLikesInfo: existingPost.extendedLikesInfo || {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: []
          }
        },
      },
    );

    if (updateResult.matchedCount < 1) {
      throw new Error('Post not found');
    }
    return;
  }

  // Удалить post по ID
  async delete(id: string): Promise<void> {
    const deleteResult = await postsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      throw new Error('Post not found');
    }

    return;
  }

  async updatePostLikeStatus(postId: string, userId: string, likeStatus: LikeStatus): Promise<void> {
    const post = await this.findById(postId);
    if (!post) {
      return; // Сервис уже проверил наличие поста
    }
    
    // Получаем текущие лайки поста или создаем пустой массив
    const currentPost = await postsCollection.findOne({ _id: new ObjectId(postId) });
    const likes: PostLike[] = (currentPost as any).likes || [];
    
    // Находим существующий лайк от этого пользователя
    const existingLikeIndex = likes.findIndex(like => like.userId === userId);
    
    // Получаем логин пользователя - ИСПРАВЛЕНИЕ: всегда получаем реальный логин
    let userLogin = `user${userId}`; // fallback
    try {
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
      if (user?.login) {
        userLogin = user.login;
      }
    } catch (error) {
      // Если не удалось получить пользователя, используем fallback
      console.warn(`Could not find user ${userId}:`, error);
    }
    
    if (existingLikeIndex !== -1) {
      // Пользователь уже лайкал/дизлайкал - обновляем или удаляем
      if (likeStatus === 'None') {
        // Удаляем лайк
        likes.splice(existingLikeIndex, 1);
      } else {
        // Обновляем статус
        likes[existingLikeIndex] = {
          userId,
          likeStatus,
          addedAt: likes[existingLikeIndex].addedAt,
          login: userLogin
        };
      }
    } else {
      // Пользователь еще не лайкал
      if (likeStatus !== 'None') {
        likes.push({
          userId,
          likeStatus,
          addedAt: new Date().toISOString(),
          login: userLogin
        });
      }
    }
    
    // Обновляем в базе
    try {
      await postsCollection.updateOne(
        { _id: new ObjectId(postId) },
        { $set: { likes } }
      );
    } catch (error) {
      // Если невалидный ObjectId, просто выходим
      return;
    }
  }

  // Private method for mapping posts with likes info
  private mapPostWithLikesInfo(post: WithId<Post>, currentUserId?: string): WithId<Post> {
    const likes: PostLike[] = (post as any).likes || [];
    
    // Calculate counters
    const likesCount = likes.filter(like => like.likeStatus === 'Like').length;
    const dislikesCount = likes.filter(like => like.likeStatus === 'Dislike').length;
    
    // Find current user status
    let myStatus: LikeStatus = 'None';
    if (currentUserId) {
      const userLike = likes.find(like => like.userId === currentUserId);
      if (userLike) {
        myStatus = userLike.likeStatus;
      }
    }
    
    // Get the 3 most recent likes, sorted by date
    const newestLikes = likes
      .filter(like => like.likeStatus === 'Like')
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .slice(0, 3)
      .map(like => ({
        addedAt: like.addedAt,
        userId: like.userId,
        login: like.login
      }));
    
    return {
      ...post,
      extendedLikesInfo: {
        likesCount,
        dislikesCount,
        myStatus,
        newestLikes
      }
    };
  }
}
