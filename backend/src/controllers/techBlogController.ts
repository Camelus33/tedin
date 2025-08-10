import { Request, Response } from 'express';
import TechBlogPost from '../models/TechBlogPost';

const ADMIN_EMAIL = process.env.TECH_BLOG_AUTHOR_EMAIL || 'jinny5@tedin.kr';

export const listPublished = async (req: Request, res: Response) => {
  try {
    const category = (req.query.category as string) || undefined;
    const filter: any = { status: 'published' };
    if (category && ['update', 'post'].includes(category)) {
      filter.category = category;
    }
    const posts = await TechBlogPost.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .select('title slug category excerpt tags coverImageUrl publishedAt createdAt');
    res.json(posts);
  } catch (e) {
    res.status(500).json({ error: 'Failed to list posts' });
  }
};

export const getBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const post = await TechBlogPost.findOne({ slug, status: 'published' });
    if (!post) return res.status(404).json({ error: 'Not found' });
    res.json(post);
  } catch (e) {
    res.status(500).json({ error: 'Failed to get post' });
  }
};

const ensureAdminAuthor = (email?: string) => email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

export const createPost = async (req: Request, res: Response) => {
  try {
    const requesterEmail = req.user?.email || '';
    if (!ensureAdminAuthor(requesterEmail)) return res.status(403).json({ error: 'Forbidden' });

    const { title, slug, category, content, excerpt, tags, coverImageUrl, status, publishedAt } = req.body;
    const doc = await TechBlogPost.create({
      title,
      slug,
      category,
      content,
      excerpt,
      tags,
      coverImageUrl,
      status: status || 'published',
      authorEmail: ADMIN_EMAIL,
      publishedAt: publishedAt || (status !== 'draft' ? new Date() : undefined),
    });
    res.status(201).json(doc);
  } catch (e: any) {
    if (e?.code === 11000) {
      return res.status(400).json({ error: 'Duplicate slug' });
    }
    res.status(500).json({ error: 'Failed to create post' });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const requesterEmail = req.user?.email || '';
    if (!ensureAdminAuthor(requesterEmail)) return res.status(403).json({ error: 'Forbidden' });

    const { id } = req.params;
    const updates = req.body || {};
    if (updates.authorEmail) delete updates.authorEmail;
    const updated = await TechBlogPost.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update post' });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const requesterEmail = req.user?.email || '';
    if (!ensureAdminAuthor(requesterEmail)) return res.status(403).json({ error: 'Forbidden' });

    const { id } = req.params;
    const deleted = await TechBlogPost.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
};


