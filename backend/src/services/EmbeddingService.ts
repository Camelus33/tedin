import OpenAI from 'openai';
import Note from '../models/Note';

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

      const source = this.buildNoteEmbeddingSource(memo);
      const embedding = await this.generateEmbedding(source);

      await Note.findByIdAndUpdate(memoId, {
        embedding,
        embeddingGeneratedAt: new Date(),
      });

      console.log(`Generated embedding for memo: ${memoId}`);
      return embedding;
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