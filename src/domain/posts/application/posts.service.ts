import { inject, injectable } from 'inversify';
import { WithId } from 'mongodb';
import { PostQueryInput } from '../routers/input/post-query.input';
import { TYPES } from '../../../ioc/ioc.types';
import { IPostsRepository } from '../../repositories/types/posts.repository.interface';
import { IBlogsRepository } from '../../repositories/types/blogs.repository.interface';
import { Post } from '../../blog/validation/types/posts';
import { PostInputDto } from '../dto/post.input-dto';

@injectable()
export class PostsService {
  @inject(TYPES.PostsRepository) private postsRepository!: IPostsRepository;
  @inject(TYPES.BlogsRepository) private blogsRepository!: IBlogsRepository;

  constructor() {}

  async findMany(
    queryDto: PostQueryInput,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    //TODO вернуть пагинацию
    return this.postsRepository.findMany(queryDto);
  }

  async findPostsByBlog(
    queryDto: PostQueryInput,
    blogId: string,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    await this.blogsRepository.findByIdOrFail(blogId);

    return this.postsRepository.findPostsByBlog(queryDto, blogId);
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
