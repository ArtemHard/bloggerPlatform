export type LikeStatus = 'None' | 'Like' | 'Dislike';

export type LikeDetails = {
  addedAt: string;
  userId: string;
  login: string;
};

// Тип для хранения лайков пользователей
export type PostLike = {
  userId: string;
  likeStatus: LikeStatus;
  addedAt: string;
  login: string;
};

export type ExtendedLikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: LikeDetails[];
};

export type Post = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfo;
  likes?: PostLike[]; // Добавляем опциональное поле для лайков
};
