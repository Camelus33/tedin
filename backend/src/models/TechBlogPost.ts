import mongoose, { Document, Schema } from 'mongoose';

export type TechBlogCategory = 'update' | 'post';
export type TechBlogStatus = 'draft' | 'published';

export interface ITechBlogPost extends Document {
  title: string;
  slug: string;
  category: TechBlogCategory;
  content: string;
  excerpt?: string;
  tags?: string[];
  coverImageUrl?: string;
  status: TechBlogStatus;
  authorEmail: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TechBlogPostSchema: Schema<ITechBlogPost> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, enum: ['update', 'post'], required: true },
    content: { type: String, required: true },
    excerpt: { type: String, default: '' },
    tags: { type: [String], default: [] },
    coverImageUrl: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    authorEmail: { type: String, required: true, lowercase: true, trim: true },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

TechBlogPostSchema.index({ slug: 1 }, { unique: true });
TechBlogPostSchema.index({ category: 1, status: 1, publishedAt: -1 });

export default mongoose.models.TechBlogPost || mongoose.model<ITechBlogPost>('TechBlogPost', TechBlogPostSchema);


