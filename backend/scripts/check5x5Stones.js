const mongoose = require('mongoose');

async function check5x5Stones() {
  await mongoose.connect('mongodb://localhost:27017/habitus33');
  const ZengoProverbContent = mongoose.model('ZengoProverbContent', new mongoose.Schema({}, { strict: false }));

  // 5x5(boardSize: 5) 콘텐츠 20개만 확인
  const docs = await ZengoProverbContent.find({ boardSize: 5 }).limit(20).lean();
  docs.forEach((doc, idx) => {
    console.log(`--- 콘텐츠 #${idx + 1} (ID: ${doc._id}) ---`);
    if (!doc.wordMappings || !Array.isArray(doc.wordMappings)) {
      console.log('  ⚠️ wordMappings 필드가 없음 또는 배열이 아님');
      return;
    }
    doc.wordMappings.forEach((wm, i) => {
      const x = wm.coords?.x;
      const y = wm.coords?.y;
      const outOfRange = x < 0 || x > 4 || y < 0 || y > 4;
      if (outOfRange) {
        console.log(`  ❌ [${i}] word: ${wm.word}, x: ${x}, y: ${y} (범위 초과)`);
      } else {
        console.log(`  [${i}] word: ${wm.word}, x: ${x}, y: ${y}`);
      }
    });
  });
  await mongoose.disconnect();
}

check5x5Stones(); 