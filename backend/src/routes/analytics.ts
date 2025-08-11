import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import ThoughtEvent from '../models/ThoughtEvent';
import Note from '../models/Note';
import mongoose from 'mongoose';
import { embeddingService } from '../services/EmbeddingService';

const router = Router();

// GET /api/analytics/similar
// body: { text: string, limit?: number, hourBucket?: number, weekday?: number }
router.post('/similar', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: '인증이 필요합니다.' });

    const { text, limit = 5, hourBucket, weekday } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ message: 'text가 필요합니다.' });
    }

    // 후보 집합: 최근 임베딩이 존재하는 노트만 제한적으로 조회(최대 500)
    const match: any = { userId, embedding: { $exists: true, $ne: null } };
    if (typeof hourBucket === 'number') {
      // createdAt의 시간대가 hourBucket과 근접(±1시간)인 후보만 선택
      // 단순 구현: 최근 2000건에서 필터
    }
    const recentPool = await Note.find({ userId, embedding: { $exists: true, $ne: null } })
      .sort({ createdAt: -1 })
      .limit(2000)
      .select('_id content createdAt embedding bookId')
      .lean();

    const filterByTime = (docs: any[]) => {
      if (typeof hourBucket !== 'number' && typeof weekday !== 'number') return docs;
      return docs.filter(d => {
        const dt = new Date(d.createdAt);
        const h = dt.getHours();
        const w = dt.getDay(); // 0=Sun
        const hourOk = typeof hourBucket === 'number' ? Math.min(Math.abs(h - hourBucket), 24 - Math.abs(h - hourBucket)) <= 1 : true;
        const weekOk = typeof weekday === 'number' ? w === weekday : true;
        return hourOk && weekOk;
      });
    };

    const recentNotes = filterByTime(recentPool).slice(0, 500);

    // 임베딩이 하나도 없으면 문자열 유사도 베이스라인으로 안전하게 폴백
    if (!recentNotes || recentNotes.length === 0) {
      const normalize = (s: string) => (s || '').toLowerCase().replace(/\s+/g, ' ').slice(0, 400);
      const jaccard = (a: string, b: string) => {
        const sa = new Set(normalize(a).split(' '));
        const sb = new Set(normalize(b).split(' '));
        const inter = [...sa].filter(x => sb.has(x)).length;
        const uni = new Set([...sa, ...sb]).size;
        return uni === 0 ? 0 : inter / uni;
      };
      const baseline = await Note.find({ userId })
        .sort({ createdAt: -1 })
        .limit(200)
        .select('_id content createdAt bookId')
        .lean();
      const scored = baseline
        .map(n => ({ _id: n._id, bookId: n.bookId, content: n.content, createdAt: n.createdAt, score: jaccard(text, n.content || '') }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
      return res.status(200).json({ query: text.slice(0, 200), results: scored, mode: 'jaccard_fallback' });
    }

    // 질의 임베딩 생성
    let queryEmbedding: number[];
    try {
      queryEmbedding = await embeddingService.generateEmbedding(text);
    } catch (e) {
      // OPENAI_API_KEY 미설정 등으로 임베딩 실패 시 폴백
      const normalize = (s: string) => (s || '').toLowerCase().replace(/\s+/g, ' ').slice(0, 400);
      const jaccard = (a: string, b: string) => {
        const sa = new Set(normalize(a).split(' '));
        const sb = new Set(normalize(b).split(' '));
        const inter = [...sa].filter(x => sb.has(x)).length;
        const uni = new Set([...sa, ...sb]).size;
        return uni === 0 ? 0 : inter / uni;
      };
      const scored = recentNotes
        .map(n => ({ _id: n._id, content: n.content, createdAt: n.createdAt, score: jaccard(text, n.content || '') }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
      return res.status(200).json({ query: text.slice(0, 200), results: scored, mode: 'jaccard_fallback' });
    }

    // 코사인 유사도 계산
    const cosine = (a: number[], b: number[]) => {
      const len = Math.min(a.length, b.length);
      let dot = 0, na = 0, nb = 0;
      for (let i = 0; i < len; i++) {
        const va = a[i] || 0;
        const vb = b[i] || 0;
        dot += va * vb;
        na += va * va;
        nb += vb * vb;
      }
      const denom = Math.sqrt(na) * Math.sqrt(nb) || 1;
      return dot / denom;
    };

    const scored = recentNotes
      .map((n: any) => ({
        _id: n._id,
        bookId: n.bookId,
        content: n.content,
        createdAt: n.createdAt,
        score: Array.isArray(n.embedding) && n.embedding.length > 0 ? cosine(queryEmbedding, n.embedding) : -1,
      }))
      .filter(x => x.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return res.status(200).json({ query: text.slice(0, 200), results: scored, mode: 'embedding_cosine' });
  } catch (error) {
    console.error('similar analytics error:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// GET /api/analytics/metrics
router.get('/metrics', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: '인증이 필요합니다.' });

    // 간단한 베이스라인: 최근 이벤트 수/최근 링크 수. 추후 speed/direction/curvature/expansion으로 확장
    const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const eventsCount = await ThoughtEvent.countDocuments({ userId, createdAt: { $gte: since } });
    const notesWithLinks = await Note.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: { path: '$relatedLinks', preserveNullAndEmptyArrays: false } },
      { $match: { 'relatedLinks.createdAt': { $gte: since } } },
      { $count: 'links' }
    ]);

    return res.status(200).json({
      since,
      eventsCount,
      recentLinks: notesWithLinks?.[0]?.links || 0,
    });
  } catch (error) {
    console.error('metrics analytics error:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// Thought Pattern Mapping (TPM): 시간대/요일 기준 유사 텍스트 반복 탐지(간단 카운트)
router.get('/repetition', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: '인증이 필요합니다.' });

    const { days = 30 } = req.query as any;
    const since = new Date(Date.now() - Math.max(1, Math.min(120, Number(days))) * 24 * 3600 * 1000);

    // ThoughtEvent의 hourBucket/weekday를 활용해 집계 (사전 채워져 있지 않은 데이터는 createdAt에서 보정)
    const events = await ThoughtEvent.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), createdAt: { $gte: since } } },
      {
        $addFields: {
          hourBucket: { $ifNull: ['$hourBucket', { $hour: '$createdAt' }] },
          weekday: { $ifNull: ['$weekday', { $dayOfWeek: '$createdAt' }] }, // 1..7 (Sun=1)
        },
      },
      {
        $group: {
          _id: { hour: '$hourBucket', weekday: { $subtract: ['$weekday', 1] } }, // 0..6
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return res.status(200).json({ since, buckets: events });
  } catch (e) {
    console.error('repetition analytics error:', e);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 방향 예측(간단 전이 확률): 최근 메모 임베딩 벡터 방향과 유사한 과거 전이 목적지를 Top-3 추천
router.get('/direction', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: '인증이 필요합니다.' });

    // 최근 노트 10개 임베딩으로 대략적인 방향 벡터 계산
    const recent = await Note.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('embedding tags content createdAt')
      .lean();

    const emb = recent.map((r: any) => r.embedding).filter((v: any) => Array.isArray(v) && v.length > 0);
    if (emb.length < 2) return res.status(200).json({ message: 'insufficient_embeddings', suggestions: [] });

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const mean = emb[0].map((_: any, i: number) => avg(emb.map((v: number[]) => v[i] || 0)));
    const last = emb[0];
    const dir = last.map((v: number, i: number) => v - (mean[i] || 0));

    // 간단 KNN: 과거 노트 500개에서 dir과 가장 코사인 유사한 임베딩 Top-50을 찾고 태그/키워드 빈도로 추천
    const pool = await Note.find({ userId })
      .sort({ createdAt: -1 })
      .skip(10)
      .limit(500)
      .select('embedding tags content createdAt')
      .lean();

    const cosine = (a: number[], b: number[]) => {
      const len = Math.min(a.length, b.length);
      let dot = 0, na = 0, nb = 0;
      for (let i = 0; i < len; i++) { const va = a[i] || 0, vb = b[i] || 0; dot += va * vb; na += va*va; nb += vb*vb; }
      const denom = Math.sqrt(na) * Math.sqrt(nb) || 1;
      return dot / denom;
    };

    const scored = pool
      .filter(n => Array.isArray((n as any).embedding) && (n as any).embedding.length > 0)
      .map(n => ({ n, score: cosine(dir, (n as any).embedding) }))
      .sort((a,b) => b.score - a.score)
      .slice(0, 50);

    // 태그/키워드 기반 간단 추천(태그가 없으면 내용 상위 단어 토큰화 대체 가능)
    const tagCounts: Record<string, number> = {};
    for (const { n } of scored) {
      const tags = Array.isArray((n as any).tags) ? (n as any).tags : [];
      for (const t of tags) tagCounts[String(t)] = (tagCounts[String(t)] || 0) + 1;
    }
    const suggestions = Object.entries(tagCounts)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag, count]) => ({ tag, votes: count }));

    return res.status(200).json({ message: 'ok', suggestions });
  } catch (e) {
    console.error('direction analytics error:', e);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});
// GET /api/analytics/aggregate
// 고해상도 지표: speed(의미 속도), curvature(곡률), rhythm(간격/버스트), 시간대 분포
router.get('/aggregate', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: '인증이 필요합니다.' });

    // 기간 필터 (기본: 최근 30일)
    const { days } = req.query as any;
    const lookbackDays = Math.max(1, Math.min(120, Number(days) || 30));
    const since = new Date(Date.now() - lookbackDays * 24 * 3600 * 1000);

    // 준비: 노트(임베딩 포함), 이벤트 수집
    const notes = await Note.find({
      userId,
      createdAt: { $gte: since },
      embedding: { $exists: true, $ne: null }
    })
      .sort({ createdAt: 1 })
      .select('_id createdAt embedding')
      .lean();

    const events = await ThoughtEvent.find({ userId, createdAt: { $gte: since } })
      .sort({ createdAt: 1 })
      .select('createdAt type')
      .lean();

    // 수학 도우미
    const cosine = (a: number[], b: number[]) => {
      const len = Math.min(a.length, b.length);
      let dot = 0, na = 0, nb = 0;
      for (let i = 0; i < len; i++) { const va = a[i] || 0, vb = b[i] || 0; dot += va * vb; na += va * va; nb += vb * vb; }
      const denom = Math.sqrt(na) * Math.sqrt(nb) || 1;
      return dot / denom;
    };
    const sub = (a: number[], b: number[]) => a.map((v, i) => (v || 0) - (b[i] || 0));
    const norm = (v: number[]) => Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    const unit = (v: number[]) => { const n = norm(v) || 1; return v.map(x => x / n); };
    const angleBetween = (u: number[], v: number[]) => { const c = cosine(u, v); const clamped = Math.max(-1, Math.min(1, c)); return Math.acos(clamped); };

    // 의미 속도: 인접 메모 간 (1 - cosine) / Δt(minutes)
    let speeds: number[] = [];
    let curvatures: number[] = [];
    if (notes.length >= 2) {
      const deltas: number[][] = [];
      for (let i = 1; i < notes.length; i++) {
        const prev = notes[i - 1];
        const curr = notes[i];
        const dtMin = Math.max(0.001, (new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime()) / 60000);
        const cos = cosine(prev.embedding as any, curr.embedding as any);
        const dist = 1 - cos;
        speeds.push(dist / dtMin);
        deltas.push(sub(curr.embedding as any, prev.embedding as any));
      }
      for (let i = 1; i < deltas.length; i++) {
        const u = unit(deltas[i - 1]);
        const v = unit(deltas[i]);
        curvatures.push(angleBetween(u, v));
      }
    }

    // 리듬: 이벤트 간 Δt, 평균/표준편차/변동계수(CV)
    let intervalsMin: number[] = [];
    if (events.length >= 2) {
      for (let i = 1; i < events.length; i++) {
        const dtMin = (new Date(events[i].createdAt).getTime() - new Date(events[i - 1].createdAt).getTime()) / 60000;
        intervalsMin.push(dtMin);
      }
    }
    const mean = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    const std = (arr: number[]) => { if (arr.length === 0) return 0; const m = mean(arr); return Math.sqrt(arr.reduce((s, x) => s + (x - m) * (x - m), 0) / arr.length); };
    const speedsMean = mean(speeds), speedsStd = std(speeds);
    const curvatureMean = mean(curvatures), curvatureStd = std(curvatures);
    const intervalMean = mean(intervalsMin), intervalStd = std(intervalsMin);
    const intervalCV = intervalMean > 0 ? intervalStd / intervalMean : 0;
    const burstiness = intervalCV; // 간단 지표

    // 시간대/요일 분포
    const hourHist = Array(24).fill(0);
    const weekdayHist = Array(7).fill(0);
    for (const e of events) { const d = new Date(e.createdAt); hourHist[d.getHours()]++; weekdayHist[d.getDay()]++; }

    return res.status(200).json({
      rangeDays: lookbackDays,
      samples: { notes: notes.length, events: events.length },
      speed: { mean: speedsMean, std: speedsStd, count: speeds.length },
      curvature: { mean: curvatureMean, std: curvatureStd, count: curvatures.length },
      rhythm: { intervalMeanMin: intervalMean, intervalStdMin: intervalStd, intervalCV, burstinessIndex: burstiness, count: intervalsMin.length },
      timeOfDay: { byHour: hourHist, byWeekday: weekdayHist }
    });
  } catch (error) {
    console.error('aggregate analytics error:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router;


