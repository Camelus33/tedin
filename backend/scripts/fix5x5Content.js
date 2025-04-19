const mongoose = require('mongoose');

async function fix5x5Content() {
  await mongoose.connect('mongodb://localhost:27017/habitus33');
  const ZengoProverbContent = mongoose.model('ZengoProverbContent', new mongoose.Schema({}, { strict: false }));

  // 5x5(boardSize: 5) 콘텐츠 모두 조회
  const docs = await ZengoProverbContent.find({ boardSize: 5 }).lean();
  for (const doc of docs) {
    let changed = false;
    const usedPositions = new Set();
    // 기존 좌표 중 정상 범위만 우선 등록
    doc.wordMappings.forEach(wm => {
      const { x, y } = wm.coords || {};
      if (x >= 0 && x <= 4 && y >= 0 && y <= 4) {
        usedPositions.add(`${x},${y}`);
      }
    });
    // 좌표 오류 수정
    const newWordMappings = doc.wordMappings.map(wm => {
      let { x, y } = wm.coords || {};
      if (x < 0 || x > 4 || y < 0 || y > 4 || usedPositions.has(`${x},${y}`)) {
        // 0~4 범위 내에서 중복 없는 좌표 랜덤 할당
        let nx, ny, posStr;
        do {
          nx = Math.floor(Math.random() * 5);
          ny = Math.floor(Math.random() * 5);
          posStr = `${nx},${ny}`;
        } while (usedPositions.has(posStr));
        usedPositions.add(posStr);
        changed = true;
        return { ...wm, coords: { x: nx, y: ny } };
      } else {
        usedPositions.add(`${x},${y}`);
        return wm;
      }
    });
    // initialDisplayTimeMs 일괄 변경
    if (doc.initialDisplayTimeMs !== 15000) {
      changed = true;
    }
    if (changed) {
      await ZengoProverbContent.updateOne(
        { _id: doc._id },
        { $set: { wordMappings: newWordMappings, initialDisplayTimeMs: 15000 } }
      );
      console.log(`수정됨: _id=${doc._id}`);
      newWordMappings.forEach((wm, i) => {
        console.log(`  [${i}] word: ${wm.word}, x: ${wm.coords.x}, y: ${wm.coords.y}`);
      });
      console.log(`  initialDisplayTimeMs: 15000`);
    }
  }
  await mongoose.disconnect();
}

fix5x5Content(); 