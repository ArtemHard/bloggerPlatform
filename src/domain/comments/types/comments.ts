import { ObjectId } from 'mongodb';
import { PaginatedOutput } from '../../../core/types/paginated.output';
import { LikeStatus } from '../enums/like-status.enum';

export interface CommentLike {
  userId: string;
  status: LikeStatus;
  addedAt: string;
}

export interface LikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
}

export interface CommentType {
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likes?: CommentLike[];
  likesInfo?: LikesInfo;
}

export interface CommentInputDto {
  content: string;
}

export interface CommentViewModel extends Omit<CommentType, 'likesInfo'> {
  id: string;
  likesInfo: LikesInfo;
}

export type CommentListPaginatedOutput = {
    items: CommentViewModel[];
  } & PaginatedOutput;