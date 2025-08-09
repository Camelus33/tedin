import { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth';
import { embeddingService } from '../services/EmbeddingService';
import Note from '../models/Note';

const router = Router();

// GET /api/diagnostics/env
// Admin only. Returns booleans for presence of sensitive envs. Never returns values.
router.get('/env', authenticate, requireAdmin, async (req, res) => {
  try {
    const openaiPresent = !!process.env.OPENAI_API_KEY;
    const anthropicPresent = !!process.env.ANTHROPIC_API_KEY;
    const googlePresent = !!process.env.GOOGLE_API_KEY;
    return res.status(200).json({
      openaiPresent,
      anthropicPresent,
      googlePresent,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/diagnostics/embedding
// Admin only. Attempts to create an embedding for a short text; returns success boolean.
router.post('/embedding', authenticate, requireAdmin, async (req, res) => {
  try {
    const text: string = (req.body && req.body.text) || 'ping';
    try {
      const vec = await embeddingService.generateEmbedding(text);
      if (Array.isArray(vec) && vec.length > 0) {
        return res.status(200).json({ ok: true, dims: vec.length });
      }
      return res.status(500).json({ ok: false, error: 'Empty embedding' });
    } catch (err: any) {
      return res.status(200).json({ ok: false, error: err?.message || 'Embedding failed' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

// Utility (optional): simple batch embedding endpoint (admin)
router.post('/embedding/batch', authenticate, requireAdmin, async (req, res) => {
  try {
    const limit: number = Number(req.body?.limit || 200);
    const cursorId: string | null = req.body?.cursorId || null;

    const query: any = {
      $or: [
        { embedding: { $exists: false } },
        { embedding: null }
      ]
    };
    if (cursorId) {
      query._id = { $gt: cursorId };
    }

    const batch = await Note.find(query).sort({ _id: 1 }).limit(limit).select('_id content').lean();
    let processed = 0;
    for (const m of batch) {
      try {
        const emb = await embeddingService.generateEmbedding(m.content || '');
        await Note.findByIdAndUpdate(m._id, { embedding: emb, embeddingGeneratedAt: new Date() });
        processed++;
        await new Promise(r => setTimeout(r, 80));
      } catch (e) {
        // continue
      }
    }

    const nextCursor = batch.length > 0 ? String(batch[batch.length - 1]._id) : null;
    return res.status(200).json({ processed, nextCursor });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});


