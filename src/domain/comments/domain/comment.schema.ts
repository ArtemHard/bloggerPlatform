import { Schema, model, Model, HydratedDocument } from 'mongoose';
import { ICommentDB } from '../types/comment.db.interface';
import { CommentLike, LikesInfo } from '../types/comments';
import { LikeStatus } from '../enums/like-status.enum';

// Sub-schema for CommentLike
const commentLikeSchema = new Schema<CommentLike>({
  userId: { type: String, required: true },
  status: { type: String, required: true },
  addedAt: { type: String, required: true },
}, { _id: false });

// Sub-schema for LikesInfo
const likesInfoSchema = new Schema<LikesInfo>({
  likesCount: { type: Number, required: true, default: 0 },
  dislikesCount: { type: Number, required: true, default: 0 },
  myStatus: { type: String, required: true },
}, { _id: false });

// Main comment schema
const commentSchema = new Schema<ICommentDB>({
  content: { type: String, required: true },
  commentatorInfo: {
    userId: { type: String, required: true },
    userLogin: { type: String, required: true },
  },
  createdAt: { type: String, required: true },
  postId: { type: String, required: true },
  likes: { type: [commentLikeSchema], default: [] },
  likesInfo: { type: likesInfoSchema, required: true },
});

// Instance methods
commentSchema.methods.addLike = function(userId: string, status: LikeStatus) {
  const comment = this as any;
  
  // Remove existing like from this user if any
  comment.likes = comment.likes.filter((like: CommentLike) => like.userId !== userId);
  
  // Add new like if status is not None
  if (status !== 'None') {
    comment.likes.push({
      userId,
      status,
      addedAt: new Date().toISOString(),
    });
  }
  
  // Update likesInfo
  const likesCount = comment.likes.filter((like: CommentLike) => like.status === 'Like').length;
  const dislikesCount = comment.likes.filter((like: CommentLike) => like.status === 'Dislike').length;
  
  comment.likesInfo.likesCount = likesCount;
  comment.likesInfo.dislikesCount = dislikesCount;
};

commentSchema.methods.updateMyStatus = function(userId: string, status: LikeStatus) {
  const comment = this as any;
  const userLike = comment.likes.find((like: CommentLike) => like.userId === userId);
  
  if (userLike) {
    comment.likesInfo.myStatus = userLike.status;
  } else {
    comment.likesInfo.myStatus = 'None';
  }
};

// Static methods
commentSchema.statics.createComment = function(
  content: string,
  userId: string,
  userLogin: string,
  postId: string
) {
  const createdAt = new Date().toISOString();
  const likesInfo: LikesInfo = {
    likesCount: 0,
    dislikesCount: 0,
    myStatus: 'None' as LikeStatus
  };
  
  return new this({
    content,
    commentatorInfo: {
      userId,
      userLogin,
    },
    createdAt,
    postId,
    likes: [],
    likesInfo
  });
};

// Type definitions
export type CommentDocument = HydratedDocument<ICommentDB>;
export type CommentModelType = Model<ICommentDB> & {
  createComment(content: string, userId: string, userLogin: string, postId: string): CommentDocument;
};

// Create and export the model
export const CommentModel = model<ICommentDB, CommentModelType>('comments', commentSchema);
