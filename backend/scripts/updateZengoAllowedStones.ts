import mongoose from 'mongoose';

const ZengoProverbContent = mongoose.model('ZengoProverbContent', new mongoose.Schema({}, { strict: false }));

async function updateAllowedStones() {
  // TODO: 실제 운영 DB 주소/이름으로 교체하세요
  await mongoose.connect('mongodb://localhost:27017/habitus33');

  // 컬렉션 이름과 스키마는 실제 환경에 맞게 조정
  await ZengoProverbContent.updateMany({ boardSize: 3 }, { $set: { totalAllowedStones: 5 } });
  // 중급(5x5): 8개
  await ZengoProverbContent.updateMany({ boardSize: 5 }, { $set: { totalAllowedStones: 8 } });
  // 고급(7x7): 10개
  await ZengoProverbContent.updateMany({ boardSize: 7 }, { $set: { totalAllowedStones: 10 } });

  console.log('난이도별 최대 허용 돌 개수 업데이트 완료!');
  await mongoose.disconnect();
}

async function checkAllowedStones() {
  await mongoose.connect('mongodb://localhost:27017/habitus33');
  const docs = await ZengoProverbContent.find({ boardSize: 3 }, { boardSize: 1, totalAllowedStones: 1 }).limit(10).lean();
  docs.forEach((doc: any) => {
    console.log(`boardSize: ${doc.boardSize}, totalAllowedStones: ${doc.totalAllowedStones}`);
  });
  await mongoose.disconnect();
}

async function countBoardSizes() {
  await mongoose.connect('mongodb://localhost:27017/habitus33');

  const counts = await ZengoProverbContent.aggregate([
    { $group: { _id: '$boardSize', count: { $sum: 1 } } }
  ]);
  console.log('boardSize별 데이터 개수:', counts);
  await mongoose.disconnect();
}

function isColinear(positions) {
  if (positions.length < 3) return false;
  // 모든 3개 조합이 일렬인지 검사
  for (let i = 0; i < positions.length - 2; i++) {
    for (let j = i + 1; j < positions.length - 1; j++) {
      for (let k = j + 1; k < positions.length; k++) {
        const [a, b, c] = [positions[i], positions[j], positions[k]];
        // (b.x - a.x) * (c.y - a.y) === (b.y - a.y) * (c.x - a.x) 이면 일렬
        if ((b.x - a.x) * (c.y - a.y) === (b.y - a.y) * (c.x - a.x)) {
          return true;
        }
      }
    }
  }
  return false;
}

function generateNonColinearPositions(count, size) {
  const allPositions = [];
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      allPositions.push({ x, y });
    }
  }
  let attempts = 0;
  while (attempts < 10000) { // 충분히 큰 시도 횟수
    const shuffled = allPositions.sort(() => Math.random() - 0.5);
    const candidate = shuffled.slice(0, count);
    if (!isColinear(candidate)) {
      return candidate;
    }
    attempts++;
  }
  throw new Error('일렬이 아닌 좌표 조합을 찾지 못했습니다.');
}

// 원하는 함수만 실행
updateAllowedStones().catch(console.error);
// checkAllowedStones().catch(console.error);
countBoardSizes().catch(console.error); 