import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ZengoProverbContent from '../models/ZengoProverbContent';

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habitus33';

// 추가할 문장 배열 (예시: 영어 3x3-easy)
const newProverbs = [
  "Shine with hope",
  "Grow your grit",
  "Learn and rise"
  // ... 추가 문장
];

(async () => {
  await mongoose.connect(MONGODB_URI);
  let inserted = 0;
  for (const text of newProverbs) {
    // 중복 방지
    const exists = await ZengoProverbContent.findOne({ proverbText: text, language: 'en', level: '3x3-easy' });
    if (exists) continue;
    // 조건 체크
    const words = text.split(/\s+/);
    if (words.length < 3 || words.length > 4) continue;
    if (new Set(words).size !== words.length) continue;
    if (words.some(w => w.length > 5)) continue;
    // 업로드
    const wordMappings = words.map((word, idx) => ({ word, coords: { x: idx, y: 0 } }));
    const doc = new ZengoProverbContent({
      proverbText: text,
      language: 'en',
      level: '3x3-easy',
      boardSize: 3,
      wordMappings,
      totalWords: words.length,
      totalAllowedStones: 8,
      initialDisplayTimeMs: 4000,
      targetTimeMs: 30000,
      goPatternName: 'Basic Pattern'
    });
    await doc.save();
    inserted++;
  }
  console.log(`수동 추가 문장 ${inserted}개 업로드 완료`);
  await mongoose.disconnect();
  process.exit(0);
})(); 