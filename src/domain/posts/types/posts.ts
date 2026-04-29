import { LikeStatus, ExtendedLikesInfo } from '../validation/types/posts';

export type LikeInputModel = {
  likeStatus: LikeStatus;
};

export type PostViewModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfo;
};
