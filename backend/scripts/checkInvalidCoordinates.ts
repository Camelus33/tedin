import mongoose from 'mongoose';
import ZengoProverbContent from '../src/models/ZengoProverbContent';

async function checkInvalidCoordinates() {
  // TODO: Replace with your actual MongoDB connection string
  const dbUri = 'mongodb://localhost:27017/habitus33';
  await mongoose.connect(dbUri);

  const contents = await ZengoProverbContent.find({});
  let invalidCount = 0;

  for (const content of contents) {
    const boardSize = content.boardSize;
    content.wordMappings.forEach(mapping => {
      const x = mapping.coords.x;
      const y = mapping.coords.y;
      if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) {
        console.log(
          `Invalid coord in content ${content._id} (level=${content.level}, lang=${content.language}): word='${mapping.word}', coords=(${x}, ${y}), boardSize=${boardSize}`
        );
        invalidCount++;
      }
    });
  }

  if (invalidCount === 0) {
    console.log('모든 콘텐츠의 좌표가 정상 범위 내에 있습니다.');
  } else {
    console.log(`총 ${invalidCount}개의 잘못된 좌표가 발견되었습니다.`);
  }

  await mongoose.disconnect();
}

checkInvalidCoordinates()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error checking invalid coordinates:', error);
    process.exit(1);
  }); 