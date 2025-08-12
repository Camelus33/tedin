import { Response } from 'express';

/**
 * Simple in-memory SSE hub for per-user event streaming.
 * Note: For multi-instance deployments, replace with Redis pub/sub.
 */
class SseHub {
  private userIdToClients: Map<string, Set<Response>> = new Map();

  register(userId: string, res: Response): void {
    const key = String(userId);
    if (!this.userIdToClients.has(key)) {
      this.userIdToClients.set(key, new Set());
    }
    this.userIdToClients.get(key)!.add(res);
  }

  unregister(userId: string, res: Response): void {
    const key = String(userId);
    const set = this.userIdToClients.get(key);
    if (!set) return;
    set.delete(res);
    if (set.size === 0) this.userIdToClients.delete(key);
  }

  /**
   * Send an SSE event to a specific user.
   */
  sendToUser(userId: string, event: string, payload: any): void {
    const key = String(userId);
    const set = this.userIdToClients.get(key);
    if (!set || set.size === 0) return;
    const data = JSON.stringify(payload ?? {});
    for (const res of set) {
      try {
        res.write(`event: ${event}\n`);
        res.write(`data: ${data}\n\n`);
      } catch {
        // ignore broken pipe
      }
    }
  }
}

export const sseHub = new SseHub();


