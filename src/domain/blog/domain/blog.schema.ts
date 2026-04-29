import { Schema, model, Model, HydratedDocument } from 'mongoose';
import { Blog } from '../validation/types/blog';

// Main blog schema
const blogSchema = new Schema<Blog>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  websiteUrl: { type: String, required: true },
  createdAt: { type: String, required: true },
  isMembership: { type: Boolean, required: true, default: false },
});

// Static methods
blogSchema.statics.createBlog = function(name: string, description: string, websiteUrl: string) {
  const createdAt = new Date().toISOString();
  const isMembership = false;
  
  return new this({
    name,
    description,
    websiteUrl,
    createdAt,
    isMembership,
  });
};

// Type definitions
export type BlogDocument = HydratedDocument<Blog>;
export type BlogModelType = Model<Blog> & {
  createBlog(name: string, description: string, websiteUrl: string): BlogDocument;
};

// Create and export the model
export const BlogModel = model<Blog, BlogModelType>('blogs', blogSchema);
