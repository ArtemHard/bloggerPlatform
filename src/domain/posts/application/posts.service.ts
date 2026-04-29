import { inject, injectable } from 'inversify';
import { WithId } from 'mongodb';
import { PostQueryInput } from '../routers/input/post-query.input';
import { TYPES } from '../../../ioc/ioc.types';
import { IPostsRepository } from '../../repositories/types/posts.repository.interface';
import { IBlogsRepository } from '../../repositories/types/blogs.repository.interface';
import { Post } from '../../blog/validation/types/posts';
import { PostInputDto } from '../dto/post.input-dto';
import { LikeStatus } from '../validation/types/posts';
import { ResultStatus } from '../../../common/result/resultCode';
import { PromiseResult } from '../../../common/result/result.type';

@injectable()
export class PostsService {
  @inject(TYPES.PostsRepository) private postsRepository!: IPostsRepository;
  @inject(TYPES.BlogsRepository) private blogsRepository!: IBlogsRepository;

  constructor() {}

  async findMany(
    queryDto: PostQueryInput,
    userId?: string,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    //TODO вернуть пагинацию
    return this.postsRepository.findMany(queryDto, userId);
  }

  async findPostsByBlog(
    queryDto: PostQueryInput,
    blogId: string,
    userId?: string,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    await this.blogsRepository.findByIdOrFail(blogId);
    return this.postsRepository.findPostsByBlog(queryDto, blogId, userId);
  }

  async createPostByBlog(
    dto: Omit<PostInputDto, 'blogId'>,
    blogId: string,
  ): Promise<WithId<Post>> {
    await this.blogsRepository.findByIdOrFail(blogId);

    return this.postsRepository.create({ ...dto, blogId });
  }

  async findByIdOrFail(id: string): Promise<WithId<Post>> {
    return this.postsRepository.findByIdOrFail(id);
  }

  async updatePostLikeStatus(postId: string, userId: string, likeStatus: LikeStatus): Promise<PromiseResult<null>> {
    try {
      // Проверяем наличие поста
      const post = await this.postsRepository.findById(postId);
      
      if (!post) {
        return {
          status: ResultStatus.NotFound,
          data: null,
          extensions: [{ field: 'postId', message: 'Post not found' }],
        };
      }

      await this.postsRepository.updatePostLikeStatus(postId, userId, likeStatus);
      
      return {
        status: ResultStatus.Success,
        data: null,
        extensions: [],
      };
    } catch (error: any) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        extensions: [{ field: null, message: 'Internal server error' }],
      };
    }
  }

  // async create(dto: RideAttributes): Promise<string> {
  //   const driver = await driversRepository.findByIdOrFail(dto.driverId);

  //   // Если у водителя сейчас есть заказ, то создать новую поездку нельзя
  //   const activeRide = await ridesRepository.findActiveRideByDriverId(
  //     dto.driverId,
  //   );

  //   if (activeRide) {
  //     throw new DomainError(
  //       `Driver has an active ride. Complete or cancel the ride first`,
  //       DriverErrorCode.HasActiveRide,
  //     );
  //   }

  //   const newRide: Ride = {
  //     clientName: dto.clientName,
  //     driver: {
  //       id: dto.driverId,
  //       name: driver.name,
  //     },
  //     vehicle: {
  //       licensePlate: driver.vehicle.licensePlate,
  //       name: `${driver.vehicle.make} ${driver.vehicle.model}`,
  //     },
  //     price: dto.price,
  //     currency: dto.currency,
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //     startedAt: new Date(),
  //     finishedAt: null,
  //     addresses: {
  //       from: dto.fromAddress,
  //       to: dto.toAddress,
  //     },
  //   };

  //   return await ridesRepository.createRide(newRide);
  // },

  // async finishRide(id: string) {
  //   const ride = await ridesRepository.findByIdOrFail(id);

  //   if (ride.finishedAt) {
  //     throw new DomainError(
  //       `Ride is already finished at ${ride.finishedAt}`,
  //       RideErrorCode.AlreadyFinished,
  //     );
  //   }
  //   await ridesRepository.finishRide(id, new Date());
  // },
};
