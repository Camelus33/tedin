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
        model: 'text-embedding-ada-002',
        input: truncatedText,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('OpenAI embedding generation error:', error);
      throw error;
    }
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
          // Generate embedding for memo content
          const embedding = await this.generateEmbedding(memo.content);

          // Update memo with embedding
          await Note.findByIdAndUpdate(memo._id, {
            embedding,
            embeddingGeneratedAt: new Date(),
          });

          processed++;
          console.log(`Processed memo ${processed}/${memosWithoutEmbeddings.length}: ${memo._id}`);

          // Rate limiting: wait 100ms between requests
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
      const memo = await Note.findById(memoId);
      if (!memo) {
        throw new Error('Memo not found');
      }

      const embedding = await this.generateEmbedding(memo.content);

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