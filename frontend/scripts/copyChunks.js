const fs = require('fs');
const path = require('path');

// 경로 설정
const serverDir = path.join(process.cwd(), '.next', 'server');
const chunksDir = path.join(serverDir, 'chunks');

if (fs.existsSync(chunksDir)) {
  fs.readdirSync(chunksDir).forEach((file) => {
    if (file.endsWith('.js')) {
      const src = path.join(chunksDir, file);
      const dest = path.join(serverDir, file);
      fs.copyFileSync(src, dest);
    }
  });
}
