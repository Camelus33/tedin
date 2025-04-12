# MongoDB Zengo 컬렉션 업데이트 스크립트

이 스크립트는 MongoDB의 'zengo' 컬렉션에 저장된 속담 데이터의 일관성을 보장하기 위해 만들어졌습니다.

## 해결하는 문제

1. **테스트 데이터 삭제**:
   - "Auto generated proverb"로 시작하는 모든 테스트 속담을 제거합니다.

2. **totalWords와 wordMappings 길이 불일치 수정**:
   - `totalWords` 값이 실제 `wordMappings` 배열의 길이와 다른 경우를 찾아 수정합니다.

3. **totalAllowedStones 최소값 보장**:
   - `totalAllowedStones`가 `totalWords`보다 작은 경우를 찾아 `totalWords + 3`으로 수정합니다.
   - 이를 통해 플레이어가 게임을 완료할 수 있도록 충분한 돌을 제공합니다.

## 사용 방법

1. 스크립트 실행:
   ```bash
   node scripts/update-zengo-data.js
   ```

2. MongoDB URI 설정 (기본값 사용하지 않을 경우):
   ```bash
   MONGODB_URI=mongodb://your-custom-uri:27017/yourdb node scripts/update-zengo-data.js
   ```

## 적용 후 확인 쿼리

업데이트 적용 후 다음 쿼리를 사용하여 데이터 일관성을 확인할 수 있습니다:

```javascript
// 모든 속담 데이터 확인
db.zengo.find().forEach(function(doc) {
  print(`"${doc.proverbText}" - totalWords: ${doc.totalWords}, wordMappings: ${doc.wordMappings.length}, totalAllowedStones: ${doc.totalAllowedStones}`);
  
  // 불일치 확인
  if (doc.totalWords !== doc.wordMappings.length) {
    print("  ❌ totalWords와 wordMappings 길이 불일치!");
  }
  
  if (doc.totalAllowedStones < doc.totalWords) {
    print("  ❌ totalAllowedStones가 totalWords보다 작음!");
  }
});

// 문제 데이터만 찾기
db.zengo.find({
  $or: [
    { proverbText: /^Auto generated proverb/ },
    { $expr: { $ne: ["$totalWords", { $size: "$wordMappings" }] } },
    { $expr: { $lt: ["$totalAllowedStones", "$totalWords"] } }
  ]
}).count();
```

## 주의 사항

- 스크립트 실행 전 데이터베이스 백업을 권장합니다.
- 프로덕션 환경에서 실행 시 주의하세요. 