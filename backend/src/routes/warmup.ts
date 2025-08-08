import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import WarmupBatch from '../models/WarmupBatch';
import WarmupEvent, { WarmupModeId } from '../models/WarmupEvent';
import Session from '../models/Session';

const router = Router();

// Simple validators (inline to avoid adding zod right now)
const isValidMode = (mode: any): mode is WarmupModeId => (
  mode === 'guided_breathing' || mode === 'peripheral_vision' || mode === 'text_flow'
);

router.post('/ts/warmup/events', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId, warmupVersion, device, events } = req.body || {};

    if (!sessionId || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Session belongs to user?
    const session = await Session.findById(sessionId).select('_id userId');
    if (!session || String(session.userId) !== String(userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Create a batch snapshot (optional)
    const batch = await WarmupBatch.create({
      userId,
      sessionId,
      warmupVersion: warmupVersion || 'v1',
      device: device || {},
    });

    // Validate and map events
    const docs = [] as any[];
    const now = new Date();
    for (const ev of events) {
      const { mode, eventType, ts, clientEventId, data } = ev || {};
      if (!isValidMode(mode) || !eventType || !clientEventId || !data) continue;
      const tsDate = ts ? new Date(ts) : now;
      if (isNaN(tsDate.getTime())) continue;
      docs.push({
        userId,
        sessionId,
        mode,
        eventType,
        ts: tsDate,
        clientEventId,
        data,
        deviceSnapshotId: batch._id,
      });
    }

    if (docs.length === 0) {
      return res.status(400).json({ error: 'No valid events' });
    }

    // Bulk insert; ignore duplicates by clientEventId unique index
    const inserted = await WarmupEvent.insertMany(docs, { ordered: false });
    return res.status(200).json({ ok: true, inserted: inserted.length, batchId: batch._id });
  } catch (error: any) {
    // Handle duplicate keys gracefully
    if (error?.name === 'BulkWriteError') {
      return res.status(200).json({ ok: true, inserted: error.result?.nInserted ?? 0, note: 'Some duplicates ignored' });
    }
    console.error('[warmup events] error', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/ts/warmup/session/:sessionId/events', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    const { mode, eventType, from, to } = req.query as any;

    const session = await Session.findById(sessionId).select('_id userId');
    if (!session || String(session.userId) !== String(userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const filter: any = { userId, sessionId };
    if (mode && isValidMode(mode)) filter.mode = mode;
    if (eventType) filter.eventType = String(eventType);
    if (from || to) {
      filter.ts = {} as any;
      if (from) filter.ts.$gte = new Date(String(from));
      if (to) filter.ts.$lte = new Date(String(to));
    }

    const events = await WarmupEvent.find(filter).sort({ ts: 1 }).lean();
    return res.status(200).json({ ok: true, events });
  } catch (error) {
    console.error('[warmup events query] error', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;


