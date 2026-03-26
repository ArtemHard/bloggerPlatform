import { CommentType } from "./comments";

export interface ICommentDB extends CommentType {
postId: string;
}