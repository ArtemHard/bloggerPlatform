import { commentsRepository } from '../../repositories/comments.repository';
import { PromiseResult } from '../../../common/result/result.type';
import { ResultStatus } from '../../../common/result/resultCode';
import { postsRepository } from '../../repositories/posts.repository';
import { usersQwRepository } from '../../users/infrastructure/user.query.repository';
import { WithId } from 'mongodb';
import { CommentType } from '../types';

export const commentsService = {
  async deleteCommentById(
    commentId: string,
    userId: string,
  ): Promise<PromiseResult<null>> {
    const comment = await commentsRepository.findByIdOrFail(commentId);

    if (comment) {
      if (comment.commentatorInfo.userId !== userId) {
        return {
          status: ResultStatus.Forbidden,
          data: null,
          errorMessage: 'Forbidden',
          extensions: [
            { field: 'commentId', message: 'try to delete not your comment' },
          ],
        };
      }

      return {
        status: ResultStatus.Success,
        data: null,
        extensions: [],
      };
    }

    return {
      status: ResultStatus.NotFound,
      data: null,
      extensions: [],
    };
  },
  async updateCommentById({
    commentId,
    content,
    userId,
  }: {
    commentId: string;
    userId: string;
    content: string;
  }): Promise<PromiseResult<null>> {
    const comment = await commentsRepository.findByIdOrFail(commentId);

    if (comment) {
      if (comment.commentatorInfo.userId !== userId) {
        return {
          status: ResultStatus.Forbidden,
          data: null,
          errorMessage: 'Forbidden',
          extensions: [
            { field: 'commentId', message: 'try to update not your comment' },
          ],
        };
      }

      await commentsRepository.update(commentId, content);

      return {
        status: ResultStatus.Success,
        data: null,
        extensions: [],
      };
    }

    return {
      status: ResultStatus.NotFound,
      data: null,
      extensions: [],
    };
  },
  async createComment({
    postId,
    content,
    userId,
  }: {
    postId: string;
    userId: string;
    content: string;
  }): Promise<PromiseResult<WithId<CommentType> | null>> {
    const post = await postsRepository.findByIdOrFail(postId);

    const resultUser = await usersQwRepository.findById(userId);

    if (post && resultUser) {
      const { id, login } = resultUser;

      const comment = await commentsRepository.create({
        postId,
        content,
        commentatorInfo: {
          userId: id,
          userLogin: login,
        },
      });

      return {
        status: ResultStatus.Success,
        data: comment,
        extensions: [],
      };
    }

    return {
      status: ResultStatus.NotFound,
      data: null,
      extensions: !resultUser
        ? [{ field: 'userId', message: 'user not found' }]
        : [{ field: 'postId', message: 'post not found' }],
    };
  },
  // async findMany(
  //   queryDto: PostQueryInput,
  // ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
  //   //TODO вернуть пагинацию
  //   return commentsRepository.findMany(queryDto);
  // },

  // async findPostsByBlog(
  //   queryDto: PostQueryInput,
  //   blogId: string,
  // ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
  //   await blogsRepository.findByIdOrFail(blogId);

  //   return postsRepository.findPostsByBlog(queryDto, blogId);
  // },

  // async createPostByBlog(
  //   dto: Omit<PostInputDto, 'blogId'>,
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
