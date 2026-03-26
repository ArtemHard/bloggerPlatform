import { ObjectId } from 'mongodb';
import { PaginatedOutput } from '../../../core/types/paginated.output';

export interface CommentType {
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
}

export interface CommentInputDto {
  content: string;
}

export interface CommentViewModel extends CommentType {
  id: string;
}

export type CommentListPaginatedOutput = {
    items: CommentViewModel[];
  } & PaginatedOutput;