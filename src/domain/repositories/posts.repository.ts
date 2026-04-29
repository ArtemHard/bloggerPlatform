import { injectable } from 'inversify';
import { PostInputDto } from '../posts/dto/post.input-dto';
import { Post } from '../posts/validation/types/posts';
import { PostQueryInput } from '../posts/routers/input/post-query.input';
import { IPostsRepository } from './types/posts.repository.interface';
import { LikeStatus, PostLike } from '../posts/validation/types/posts';
import { PostModel, PostDocument } from '../posts/domain/post.schema';
import { BlogModel } from '../blog/domain/blog.schema';
import { UserModel } from '../users/domain/user.schema';

@injectable()
export class PostsRepository implements IPostsRepository {
  // Найти все posts
  async findAllPosts(
    queryDto: PostQueryInput,
    userId?: string,
  ): Promise<{ items: PostDocument[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;
    const skip = (pageNumber - 1) * pageSize;

    try {
      const items = await PostModel
        .find({})
        .sort({ [sortBy]: sortDirection === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(pageSize);
      
      const totalCount = await PostModel.countDocuments({});
      
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
    userId?: string,
  ): Promise<{ items: PostDocument[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;
    const filter: any = {};
    const skip = (pageNumber - 1) * pageSize;

    const [items, totalCount] = await Promise.all([
      PostModel
        .find(filter)
        .sort({ [sortBy]: sortDirection === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(pageSize),
      PostModel.countDocuments(filter),
    ]);
    
    // Маппим посты с информацией о лайках, передавая userId
    const mappedItems = items.map(post => this.mapPostWithLikesInfo(post, userId));
    
    return { items: mappedItems, totalCount };
  }

  async findPostsByBlog(
    queryDto: PostQueryInput,
    blogId: string,
    userId?: string,
  ): Promise<{ items: PostDocument[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;
    const skip = (pageNumber - 1) * pageSize;

    const [items, totalCount] = await Promise.all([
      PostModel
        .find({ blogId })
        .sort({ [sortBy]: sortDirection === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(pageSize),
      PostModel.countDocuments({ blogId }),
    ]);
    
    // Маппим посты с информацией о лайках, передавая userId
    const mappedItems = items.map(post => this.mapPostWithLikesInfo(post, userId));
    
    return { items: mappedItems, totalCount };
  }

  async findById(id: string): Promise<PostDocument | null> {
    try {
      const post = await PostModel.findById(id);
      if (!post) return null;
      
      // Возвращаем пост с вычисленным extendedLikesInfo
      return this.mapPostWithLikesInfo(post);
    } catch (error) {
      return null;
    }
  }

  // Метод для получения поста с информацией о лайках для конкретного пользователя
  async findByIdWithUserInfo(id: string, userId?: string): Promise<PostDocument | null> {
    try {
      const post = await PostModel.findById(id);
      if (!post) return null;
      
      return this.mapPostWithLikesInfo(post, userId);
    } catch (error) {
      return null;
    }
  }

  async findByIdOrFail(id: string): Promise<PostDocument> {
    const res = await PostModel.findById(id);

    if (!res) {
      throw new Error('Post not found');
    }
    return res;
  }

  // Создать новый post
  async create(dto: PostInputDto): Promise<PostDocument> {
    const blog = await BlogModel.findById(dto.blogId);
    const blogName = blog?.name || 'Unknown Blog';

    const newPost = PostModel.createPost(
      dto.title,
      dto.shortDescription,
      dto.content,
      dto.blogId,
      blogName
    );
    
    await newPost.save();
    return newPost;
  }

  // Обновить post по ID
  async update(
    id: string,
    { title, shortDescription, content, blogId }: PostInputDto,
  ): Promise<void> {
    const blog = await BlogModel.findById(blogId);
    const blogName = blog?.name || 'Unknown Blog';

    const existingPost = await this.findByIdOrFail(id);
    
    const updateResult = await PostModel.updateOne(
      { _id: id },
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
    const deleteResult = await PostModel.deleteOne({ _id: id });

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
    
    // Получаем логин пользователя
    let userLogin = `user${userId}`; // fallback
    try {
      const user = await UserModel.findById(userId);
      if (user?.login) {
        userLogin = user.login;
      }
    } catch (error) {
      console.warn(`Could not find user ${userId}:`, error);
    }
    
    // Используем метод модели для обновления лайков
    if (likeStatus !== 'None') {
      (post as any).addLike(userId, userLogin, likeStatus);
    } else {
      // Удаляем лайк пользователя
      post.likes = (post.likes || []).filter((like: PostLike) => like.userId !== userId);
      
      // Пересчитываем счетчики
      const likesCount = post.likes.filter((like: PostLike) => like.likeStatus === 'Like').length;
      const dislikesCount = post.likes.filter((like: PostLike) => like.likeStatus === 'Dislike').length;
      
      post.extendedLikesInfo.likesCount = likesCount;
      post.extendedLikesInfo.dislikesCount = dislikesCount;
      
      // Обновляем newest likes
      const newestLikes = post.likes
        .filter((like: PostLike) => like.likeStatus === 'Like')
        .sort((a: PostLike, b: PostLike) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
        .slice(0, 3);
      
      post.extendedLikesInfo.newestLikes = newestLikes;
    }
    
    await post.save();
  }

  // Private method for mapping posts with likes info
  private mapPostWithLikesInfo(post: PostDocument, currentUserId?: string): PostDocument {
    const likes: PostLike[] = post.likes || [];
    
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
    
    // Update extendedLikesInfo on the document
    post.extendedLikesInfo = {
      likesCount,
      dislikesCount,
      myStatus,
      newestLikes
    };
    
    return post;
  }
}
