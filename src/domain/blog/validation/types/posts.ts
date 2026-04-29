import { LikeStatus, LikeDetails, ExtendedLikesInfo } from '../../../posts/validation/types/posts';

export type Post = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfo;
};
