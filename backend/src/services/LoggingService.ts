import fs from 'fs';
import path from 'path';

/**
 * Logging Service
 * Handles structured logging for the application
 */
export class LoggingService {
  private logDir: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  /**
   * Ensure log directory exists
   */
  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Get current timestamp
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Write log to file
   */
  private writeLog(level: string, message: string, data?: any) {
    const timestamp = this.getTimestamp();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data }),
    };

    const logFile = path.join(this.logDir, `${level}.log`);
    const logLine = JSON.stringify(logEntry) + '\n';

    fs.appendFileSync(logFile, logLine);
  }

  /**
   * Log info message
   */
  info(message: string, data?: any) {
    console.log(`[INFO] ${message}`, data || '');
    this.writeLog('info', message, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data || '');
    this.writeLog('warn', message, data);
  }

  /**
   * Log error message
   */
  error(message: string, error?: any) {
    console.error(`[ERROR] ${message}`, error || '');
    this.writeLog('error', message, error);
  }

  /**
   * Log API request
   */
  logAPIRequest(req: any, res: any, duration: number) {
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
    };

    this.info('API Request', logData);
  }

  /**
   * Log search query
   */
  logSearchQuery(userId: string, query: string, results: number, filters?: any) {
    const logData = {
      userId,
      query,
      results,
      filters,
      timestamp: this.getTimestamp(),
    };

    this.info('Search Query', logData);
  }

  /**
   * Log embedding generation
   */
  logEmbeddingGeneration(memoId: string, success: boolean, error?: any) {
    const logData = {
      memoId,
      success,
      ...(error && { error: error.message }),
      timestamp: this.getTimestamp(),
    };

    if (success) {
      this.info('Embedding Generated', logData);
    } else {
      this.error('Embedding Generation Failed', logData);
    }
  }

  /**
   * Log performance metrics
   */
  logPerformance(operation: string, duration: number, metadata?: any) {
    const logData = {
      operation,
      duration: `${duration}ms`,
      ...(metadata && { metadata }),
      timestamp: this.getTimestamp(),
    };

    this.info('Performance Metric', logData);
  }

  /**
   * Get log statistics
   */
  getLogStats(): any {
    const stats = {
      info: 0,
      warn: 0,
      error: 0,
    };

    try {
      ['info', 'warn', 'error'].forEach(level => {
        const logFile = path.join(this.logDir, `${level}.log`);
        if (fs.existsSync(logFile)) {
          const content = fs.readFileSync(logFile, 'utf8');
          stats[level as keyof typeof stats] = content.split('\n').filter(line => line.trim()).length;
        }
      });
    } catch (error) {
      console.error('Error reading log stats:', error);
    }

    return stats;
  }
}

// Singleton instance
export const loggingService = new LoggingService(); 