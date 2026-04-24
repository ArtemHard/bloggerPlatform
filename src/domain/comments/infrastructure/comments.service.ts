import { inject, injectable } from 'inversify';
import { TYPES } from '../../../ioc/ioc.types';
import { ICommentsRepository } from '../../repositories/types/comments.repository.interface';
import { IPostsRepository } from '../../repositories/types/posts.repository.interface';
import { IUsersQueryRepository } from '../../repositories/types/users-query.repository.interface';
import { PromiseResult } from '../../../common/result/result.type';
import { ResultStatus } from '../../../common/result/resultCode';
import { WithId } from 'mongodb';
import { CommentType } from '../types';
import { LikeStatus } from '../enums/like-status.enum';

@injectable()
export class CommentsService {
  @inject(TYPES.CommentsRepository) private commentsRepository!: ICommentsRepository;
  @inject(TYPES.PostsRepository) private postsRepository!: IPostsRepository;
  @inject(TYPES.UsersQueryRepository) private usersQwRepository!: IUsersQueryRepository;

  constructor() {}

  async deleteCommentById(
    commentId: string,
    userId: string,
  ): Promise<PromiseResult<null>> {
    const comment = await this.commentsRepository.findByIdOrFail(commentId);

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

      await this.commentsRepository.delete(commentId);

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
  }

  async updateCommentById({
    commentId,
    content,
    userId,
  }: {
    commentId: string;
    userId: string;
    content: string;
  }): Promise<PromiseResult<null>> {
    const comment = await this.commentsRepository.findByIdOrFail(commentId);

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

      await this.commentsRepository.update(commentId, content);

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
  }

  async createComment({
    postId,
    content,
    userId,
  }: {
    postId: string;
    userId: string;
    content: string;
  }): Promise<PromiseResult<WithId<CommentType> | null>> {
    const post = await this.postsRepository.findById(postId);

    const resultUser = await this.usersQwRepository.findById(userId);

    if (post && resultUser) {
      const { id, login } = resultUser;

      const comment = await this.commentsRepository.create({
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
  }

  async updateLikeStatus({
    commentId,
    userId,
    likeStatus,
  }: {
    commentId: string;
    userId: string;
    likeStatus: LikeStatus;
  }): Promise<PromiseResult<null>> {
    const comment = await this.commentsRepository.findByIdOrFail(commentId);

    if (!comment) {
      return {
        status: ResultStatus.NotFound,
        data: null,
        extensions: [{ field: 'commentId', message: 'Comment not found' }],
      };
    }

    await this.commentsRepository.updateLikeStatus(commentId, userId, likeStatus);

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  }
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
