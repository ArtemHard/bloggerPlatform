import { CommentType } from "../types";

export interface CommentInputDto extends Omit<CommentType, 'createdAt'>  {
  postId: string;
};
