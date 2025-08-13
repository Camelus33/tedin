import OpenAI from 'openai';
import Note from '../models/Note';
import { createHash } from 'crypto';

/**
 * Embedding Service
 * Handles OpenAI embeddings generation and storage
 */
export class EmbeddingService {
  private openai: OpenAI | null = null;

  constructor() {
    // Don't initialize OpenAI client immediately
    // Will be initialized lazily when needed
  }

  /**
   * Initialize OpenAI client lazily
   */
  private initializeOpenAI() {
    if (!this.openai) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required for embedding generation');
      }
      this.openai = new OpenAI({
        apiKey,
      });
    }
    return this.openai;
  }

  /**
   * Generate embedding for text using OpenAI API
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const openai = this.initializeOpenAI();
      
      // Truncate text if too long (OpenAI has token limits)
      const truncatedText = text.length > 8000 ? text.substring(0, 8000) : text;

      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: truncatedText,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('OpenAI embedding generation error:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts using a single API call
   */
  private async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!texts || texts.length === 0) return [];
    try {
      const openai = this.initializeOpenAI();
      const inputs = texts.map(t => (t.length > 8000 ? t.substring(0, 8000) : t));
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: inputs,
      });
      return response.data.map(d => (d.embedding as unknown as number[]));
    } catch (error) {
      console.error('OpenAI batch embedding generation error:', error);
      throw error;
    }
  }

  /**
   * Build extended embedding source from a Note document
   * Includes: content + 4 evolution fields + recent inline threads (≤5) + related link reasons (≤5)
   */
  private buildNoteEmbeddingSource(note: any): string {
    const lines: string[] = [];
    const push = (label: string, value?: string | null, maxLen: number = 1000) => {
      const v = (value || '').toString().trim();
      if (!v) return;
      lines.push(`\n[${label}]`);
      lines.push(v.slice(0, maxLen));
    };

    // Core content
    push('CONTENT', note?.content, 2000);

    // Evolution fields
    push('WHY', note?.importanceReason, 600);
    push('CONTEXT', note?.momentContext, 600);
    push('ASSOCIATION', note?.relatedKnowledge, 600);
    push('IMAGE', note?.mentalImage, 600);

    // Inline threads: use latest up to 5
    const inlineThreads: any[] = Array.isArray(note?.inlineThreads)
      ? [...note.inlineThreads]
      : [];
    const sortedThreads = inlineThreads
      .map((t: any) => ({
        content: (t?.content || '').toString(),
        createdAt: new Date(t?.createdAt || 0).getTime(),
      }))
      .filter(t => t.content.trim().length > 0)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
    if (sortedThreads.length) {
      lines.push('\n[THREADS]');
      for (const t of sortedThreads) {
        lines.push('- ' + t.content.slice(0, 300));
      }
    }

    // Related link reasons: up to 5
    const linkReasons: string[] = Array.isArray(note?.relatedLinks)
      ? note.relatedLinks
          .map((l: any) => (l?.reason || '').toString().trim())
          .filter((r: string) => r.length > 0)
      : [];
    if (linkReasons.length) {
      lines.push('\n[LINK_REASONS]');
      linkReasons.slice(0, 5).forEach((r: string) => lines.push('- ' + r.slice(0, 200)));
    }

    const text = lines.join('\n').trim();
    // Cap overall size defensively
    return text.slice(0, 8000);
  }

  /**
   * Build aggregate text and segment texts with lightweight time/type encoding
   * Segments: content | why | context | association | image | thread | link_reason
   */
  private buildNoteEmbeddingSourceWithSegments(note: any): {
    aggregateText: string;
    segments: Array<{ kind: 'content' | 'why' | 'context' | 'association' | 'image' | 'thread' | 'link_reason'; text: string; createdAt: Date | null; weight?: number }>
  } {
    const formatDate = (d?: any) => {
      if (!d) return null;
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return null;
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
    };

    const safeText = (v?: string | null, maxLen = 1000) => (v || '').toString().trim().slice(0, maxLen);

    const segments: Array<{ kind: 'content' | 'why' | 'context' | 'association' | 'image' | 'thread' | 'link_reason'; text: string; createdAt: Date | null; weight?: number }> = [];

    // Content
    const noteCreated = note?.createdAt ? new Date(note.createdAt) : null;
    const contentText = safeText(note?.content, 2000);
    if (contentText) {
      segments.push({ kind: 'content', text: `[CONTENT ${formatDate(noteCreated) ?? ''}]\n${contentText}`, createdAt: noteCreated, weight: 1.0 });
    }

    // Evolution fields with timestamps
    const evo: Array<['why'|'context'|'association'|'image', string|undefined, any, number]> = [
      ['why', note?.importanceReason, note?.importanceReasonAt, 0.9],
      ['context', note?.momentContext, note?.momentContextAt, 0.9],
      ['association', note?.relatedKnowledge, note?.relatedKnowledgeAt, 0.9],
      ['image', note?.mentalImage, note?.mentalImageAt, 0.9],
    ];
    for (const [kind, value, at, weight] of evo) {
      const t = safeText(value, 600);
      if (!t) continue;
      const ts = at ? new Date(at) : null;
      segments.push({ kind, text: `[${kind.toUpperCase()} ${formatDate(ts) ?? ''}]\n${t}` , createdAt: ts, weight });
    }

    // Inline threads: oldest -> newest to encode flow; limit 7
    const inlineThreads: any[] = Array.isArray(note?.inlineThreads) ? [...note.inlineThreads] : [];
    const sortedThreads = inlineThreads
      .map((t: any) => ({
        content: safeText((t?.content || '').toString(), 300),
        createdAt: t?.createdAt ? new Date(t.createdAt) : null,
      }))
      .filter(t => t.content.length > 0)
      .sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0))
      .slice(-7);
    for (const t of sortedThreads) {
      segments.push({ kind: 'thread', text: `[THREAD ${formatDate(t.createdAt) ?? ''}]\n${t.content}`, createdAt: t.createdAt, weight: 0.7 });
    }

    // Related link reasons: include type + createdAt; limit 7
    const links: any[] = Array.isArray(note?.relatedLinks) ? [...note.relatedLinks] : [];
    const cleanedLinks = links
      .map((l: any) => ({
        type: (l?.type || '').toString(),
        reason: safeText((l?.reason || '').toString(), 200),
        createdAt: l?.createdAt ? new Date(l.createdAt) : null,
      }))
      .filter(l => l.reason.length > 0)
      .slice(-7);
    for (const l of cleanedLinks) {
      segments.push({ kind: 'link_reason', text: `[LINK ${l.type.toUpperCase()} ${formatDate(l.createdAt) ?? ''}]\n${l.reason}`, createdAt: l.createdAt, weight: 0.6 });
    }

    const aggregateText = segments.map(s => s.text).join('\n').trim().slice(0, 8000);
    return { aggregateText, segments };
  }

  /**
   * Generate embeddings for all memos without embeddings
   */
  async generateEmbeddingsForAllMemos() {
    try {
      console.log('Starting embedding generation for all memos...');

      // Find all memos without embeddings
      const memosWithoutEmbeddings = await Note.find({
        $or: [
          { embedding: { $exists: false } },
          { embedding: null },
        ],
      });

      console.log(`Found ${memosWithoutEmbeddings.length} memos without embeddings`);

      let processed = 0;
      let errors = 0;

      for (const memo of memosWithoutEmbeddings) {
        try {
          await this.generateEmbeddingForMemo(String(memo._id));
          processed++;
          console.log(`Processed memo ${processed}/${memosWithoutEmbeddings.length}: ${memo._id}`);
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          errors++;
          console.error(`Error processing memo ${memo._id}:`, error);
        }
      }

      console.log(`Embedding generation completed. Processed: ${processed}, Errors: ${errors}`);
      return { processed, errors };
    } catch (error) {
      console.error('Error generating embeddings for all memos:', error);
      throw error;
    }
  }

  /**
   * Generate embedding for a single memo
   */
  async generateEmbeddingForMemo(memoId: string) {
    try {
      const memo = await Note.findById(memoId).populate({ path: 'inlineThreads', select: 'content createdAt' });
      if (!memo) {
        throw new Error('Memo not found');
      }

      // Build aggregate text and segment texts (with time/type encoding)
      const { aggregateText, segments } = this.buildNoteEmbeddingSourceWithSegments(memo);

      // Prepare batch inputs: [aggregate, ...segments]
      const inputs: string[] = [aggregateText, ...segments.map(s => s.text)];
      const vectors = await this.generateEmbeddings(inputs);
      const aggregateVector = vectors[0] || [];

      // Map back segment vectors
      const segmentEmbeddings = segments.map((s, idx) => {
        const vec = vectors[idx + 1] || [];
        const textHash = createHash('sha1').update(s.text).digest('hex');
        return {
          kind: s.kind,
          textHash,
          createdAt: s.createdAt || null,
          vector: vec,
          weight: s.weight ?? null,
        };
      });

      await Note.findByIdAndUpdate(memoId, {
        embedding: aggregateVector,
        embeddingGeneratedAt: new Date(),
        segmentEmbeddings,
      });

      console.log(`Generated embedding for memo: ${memoId}`);
      return aggregateVector;
    } catch (error) {
      console.error('Error generating embedding for memo:', error);
      throw error;
    }
  }

  /**
   * Batch generate embeddings with rate limiting
   */
  async batchGenerateEmbeddings(memoIds: string[], batchSize: number = 10) {
    try {
      console.log(`Starting batch embedding generation for ${memoIds.length} memos`);

      const results = [];
      const batches = [];

      // Split into batches
      for (let i = 0; i < memoIds.length; i += batchSize) {
        batches.push(memoIds.slice(i, i + batchSize));
      }

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} memos)`);

        const batchPromises = batch.map(async (memoId) => {
          try {
            return await this.generateEmbeddingForMemo(memoId);
          } catch (error) {
            console.error(`Error in batch processing memo ${memoId}:`, error);
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults.filter(result => result !== null));

        // Rate limiting between batches
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`Batch embedding generation completed. Success: ${results.length}`);
      return results;
    } catch (error) {
      console.error('Error in batch embedding generation:', error);
      throw error;
    }
  }

  /**
   * Get embedding statistics
   */
  async getEmbeddingStats() {
    try {
      const totalMemos = await Note.countDocuments();
      const memosWithEmbeddings = await Note.countDocuments({
        embedding: { $exists: true, $ne: null },
      });

      return {
        total: totalMemos,
        withEmbeddings: memosWithEmbeddings,
        withoutEmbeddings: totalMemos - memosWithEmbeddings,
        percentage: totalMemos > 0 ? (memosWithEmbeddings / totalMemos) * 100 : 0,
      };
    } catch (error) {
      console.error('Error getting embedding stats:', error);
      throw error;
    }
  }
}

// Singleton instance
export const embeddingService = new EmbeddingService(); 