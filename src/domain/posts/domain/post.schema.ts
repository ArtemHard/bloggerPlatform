import { Schema, model, Model, HydratedDocument } from 'mongoose';
import { Post, PostLike, ExtendedLikesInfo, LikeStatus } from '../validation/types/posts';

// Sub-schema for PostLike
const postLikeSchema = new Schema<PostLike>({
  userId: { type: String, required: true },
  likeStatus: { type: String, required: true, enum: ['None', 'Like', 'Dislike'] },
  addedAt: { type: String, required: true },
  login: { type: String, required: true },
}, { _id: false });

// Sub-schema for ExtendedLikesInfo
const extendedLikesInfoSchema = new Schema<ExtendedLikesInfo>({
  likesCount: { type: Number, required: true, default: 0 },
  dislikesCount: { type: Number, required: true, default: 0 },
  myStatus: { type: String, required: true, enum: ['None', 'Like', 'Dislike'], default: 'None' },
  newestLikes: { type: [postLikeSchema], default: [] },
}, { _id: false });

// Main post schema
const postSchema = new Schema<Post>({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  content: { type: String, required: true },
  blogId: { type: String, required: true },
  blogName: { type: String, required: true },
  createdAt: { type: String, required: true },
  extendedLikesInfo: { type: extendedLikesInfoSchema, required: true },
  likes: { type: [postLikeSchema], default: [] },
});

// Instance methods
postSchema.methods.addLike = function(userId: string, login: string, status: LikeStatus) {
  const post = this as any;
  
  // Remove existing like from this user if any
  post.likes = post.likes.filter((like: PostLike) => like.userId !== userId);
  
  // Add new like
  post.likes.push({
    userId,
    likeStatus: status,
    addedAt: new Date().toISOString(),
    login
  });
  
  // Update extendedLikesInfo
  const likesCount = post.likes.filter((like: PostLike) => like.likeStatus === 'Like').length;
  const dislikesCount = post.likes.filter((like: PostLike) => like.likeStatus === 'Dislike').length;
  
  post.extendedLikesInfo.likesCount = likesCount;
  post.extendedLikesInfo.dislikesCount = dislikesCount;
  
  // Update newest likes (last 3 likes)
  const newestLikes = post.likes
    .filter((like: PostLike) => like.likeStatus === 'Like')
    .sort((a: PostLike, b: PostLike) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    .slice(0, 3);
  
  post.extendedLikesInfo.newestLikes = newestLikes;
};

postSchema.methods.updateMyStatus = function(userId: string, status: LikeStatus) {
  const post = this as any;
  const userLike = post.likes.find((like: PostLike) => like.userId === userId);
  
  if (userLike) {
    post.extendedLikesInfo.myStatus = userLike.likeStatus;
  } else {
    post.extendedLikesInfo.myStatus = 'None';
  }
};

// Static methods
postSchema.statics.createPost = function(title: string, shortDescription: string, content: string, blogId: string, blogName: string) {
  const createdAt = new Date().toISOString();
  const extendedLikesInfo: ExtendedLikesInfo = {
    likesCount: 0,
    dislikesCount: 0,
    myStatus: 'None',
    newestLikes: []
  };
  
  return new this({
    title,
    shortDescription,
    content,
    blogId,
    blogName,
    createdAt,
    extendedLikesInfo,
    likes: []
  });
};

// Type definitions
export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<Post> & {
  createPost(title: string, shortDescription: string, content: string, blogId: string, blogName: string): PostDocument;
};

// Create and export the model
export const PostModel = model<Post, PostModelType>('posts', postSchema);
