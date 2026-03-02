import { WithId } from 'mongodb';
import { postsRepository } from '../../repositories/posts.repository';
import { Post } from '../validation/types/posts';
import { blogsRepository } from '../../repositories/blogs.repository';
import { BlogQueryInput } from '../routers/input/blog-query.input';
import { BlogInputDto } from '../dto/blog.input-dto';
import { Blog } from '../validation/types/blog';

export const blogService = {
  async findMany(
    queryDto: BlogQueryInput,
  ): Promise<{ items: WithId<Blog>[]; totalCount: number }> {

    return blogsRepository.findAllBlogs(queryDto);
  },

  // async findPostsByBlog(
  //   queryDto: BlogQueryInput,
  //   blogId: string,
  // ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
  //   await blogsRepository.findByIdOrFail(blogId);

  //   return postsRepository.findPostsByBlog(queryDto, blogId);
  // },

  // async createPostByBlog(
  //   dto: Omit<BlogInputDto, 'blogId'>,
  //   blogId: string,
  // ): Promise<WithId<Post>> {
  //   await blogsRepository.findByIdOrFail(blogId);

  //   return postsRepository.create({ ...dto, blogId });
  // },

  // async findByIdOrFail(id: string): Promise<WithId<Post>> {
  //   return postsRepository.findByIdOrFail(id);
  // },

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
