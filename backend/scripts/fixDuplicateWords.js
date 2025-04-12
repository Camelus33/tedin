const { MongoClient, ObjectId } = require('mongodb');

async function fixDuplicateWords() {
  let client;
  
  try {
    client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    
    const db = client.db('habitus33');
    const zengoCollection = db.collection('zengo');
    
    // 수정할 문서 목록 (ID와 대체할 단어 매핑 정의)
    const replacements = [
      // 한국어 문장 수정
      {
        id: "67f758506d46232409bc82ae", // 산 넘어 산
        language: "ko",
        level: "3x3-easy",
        newWords: [
          { word: "가랑비에", coords: { x: 0, y: 0 } },
          { word: "옷", coords: { x: 1, y: 1 } },
          { word: "젖는다", coords: { x: 2, y: 2 } }
        ]
      },
      {
        id: "67f758506d46232409bc82b7", // 산 넘어 산 (중복 등록)
        language: "ko",
        level: "3x3-easy",
        newWords: [
          { word: "티끌", coords: { x: 0, y: 0 } },
          { word: "모아", coords: { x: 1, y: 1 } },
          { word: "태산", coords: { x: 2, y: 2 } }
        ]
      },
      {
        id: "67f758506d46232409bc82b9", // 간에 붙었다 쓸개에 붙었다 한다
        language: "ko",
        level: "5x5-medium",
        newWords: [
          { word: "바늘", coords: { x: 0, y: 0 } },
          { word: "도둑이", coords: { x: 1, y: 1 } },
          { word: "소", coords: { x: 2, y: 2 } },
          { word: "도둑", coords: { x: 3, y: 3 } },
          { word: "된다", coords: { x: 4, y: 4 } }
        ]
      },
      {
        id: "67f758506d46232409bc82be", // 새 술은 새 부대에 담으라
        language: "ko",
        level: "5x5-medium",
        newWords: [
          { word: "믿는", coords: { x: 0, y: 0 } },
          { word: "도끼에", coords: { x: 1, y: 1 } },
          { word: "발등", coords: { x: 2, y: 2 } },
          { word: "찍힌다", coords: { x: 3, y: 3 } },
          { word: "하더라", coords: { x: 4, y: 4 } }
        ]
      },
      {
        id: "67f758506d46232409bc82c5", // 가는 말이 고와야 오는 말이 곱다
        language: "ko",
        level: "5x5-medium",
        newWords: [
          { word: "소", coords: { x: 0, y: 0 } },
          { word: "잃고", coords: { x: 1, y: 1 } },
          { word: "외양간", coords: { x: 2, y: 2 } },
          { word: "고친다", coords: { x: 3, y: 3 } },
          { word: "하더라", coords: { x: 4, y: 4 } }
        ]
      },
      {
        id: "67f758506d46232409bc82d9", // 간에 붙었다 쓸개에 붙었다 하는 것이 보약이다
        language: "ko",
        level: "7x7-hard",
        newWords: [
          { word: "가는", coords: { x: 0, y: 0 } },
          { word: "날이", coords: { x: 1, y: 1 } },
          { word: "장날이면", coords: { x: 2, y: 2 } },
          { word: "비가", coords: { x: 3, y: 3 } },
          { word: "온다", coords: { x: 4, y: 4 } },
          { word: "하더라", coords: { x: 5, y: 5 } },
          { word: "말이다", coords: { x: 6, y: 6 } }
        ]
      },
      {
        id: "67f758506d46232409bc82da", // 말을 타면 경마장으로 배를 타면 항구로 가는 법이다
        language: "ko",
        level: "7x7-hard",
        newWords: [
          { word: "열", coords: { x: 0, y: 0 } },
          { word: "번", coords: { x: 1, y: 1 } },
          { word: "찍어", coords: { x: 2, y: 2 } },
          { word: "안", coords: { x: 3, y: 3 } },
          { word: "넘어가는", coords: { x: 4, y: 4 } },
          { word: "내가", coords: { x: 5, y: 5 } },
          { word: "바보다", coords: { x: 6, y: 6 } }
        ]
      },
      
      // 영어 문장 수정 - 5x5-medium
      {
        id: "67f758506d46232409bc8326", // When it rains it pours
        language: "en",
        level: "5x5-medium",
        newWords: [
          { word: "Time", coords: { x: 0, y: 0 } },
          { word: "heals", coords: { x: 1, y: 1 } },
          { word: "all", coords: { x: 2, y: 2 } },
          { word: "wounds", coords: { x: 3, y: 3 } },
          { word: "eventually", coords: { x: 4, y: 4 } }
        ]
      },
      {
        id: "67f758506d46232409bc832a", // Take the bull by the horns
        language: "en",
        level: "5x5-medium",
        newWords: [
          { word: "Actions", coords: { x: 0, y: 0 } },
          { word: "speak", coords: { x: 1, y: 1 } },
          { word: "louder", coords: { x: 2, y: 2 } },
          { word: "than", coords: { x: 3, y: 3 } },
          { word: "words", coords: { x: 4, y: 4 } }
        ]
      },
      {
        id: "67f8e0f03a3fb8af049daf31", // Hard work beats talent when talent fails to work
        language: "en",
        level: "5x5-medium",
        newWords: [
          { word: "Every", coords: { x: 0, y: 0 } },
          { word: "cloud", coords: { x: 1, y: 1 } },
          { word: "has", coords: { x: 2, y: 2 } },
          { word: "silver", coords: { x: 3, y: 3 } },
          { word: "lining", coords: { x: 4, y: 4 } }
        ]
      },
      {
        id: "67f8e0f03a3fb8af049daf33", // Fall seven times stand up eight times more
        language: "en",
        level: "5x5-medium",
        newWords: [
          { word: "Early", coords: { x: 0, y: 0 } },
          { word: "bird", coords: { x: 1, y: 1 } },
          { word: "catches", coords: { x: 2, y: 2 } },
          { word: "worm", coords: { x: 3, y: 3 } },
          { word: "first", coords: { x: 4, y: 4 } }
        ]
      },
      {
        id: "67f8e0f03a3fb8af049daf38", // Peace comes from within not from the outer world
        language: "en",
        level: "5x5-medium",
        newWords: [
          { word: "Where", coords: { x: 0, y: 0 } },
          { word: "there", coords: { x: 1, y: 1 } },
          { word: "will", coords: { x: 2, y: 2 } },
          { word: "way", coords: { x: 3, y: 3 } },
          { word: "exists", coords: { x: 4, y: 4 } }
        ]
      },
      
      // 영어 문장 수정 - 7x7-hard
      {
        id: "67f8dec278a9492dbe49a90c", // Twenty years from now you will be more disappoint by the things you did not do than by ones you did
        language: "en",
        level: "7x7-hard",
        newWords: [
          { word: "Courage", coords: { x: 0, y: 0 } },
          { word: "starts", coords: { x: 1, y: 1 } },
          { word: "with", coords: { x: 2, y: 2 } },
          { word: "showing", coords: { x: 3, y: 3 } },
          { word: "up", coords: { x: 4, y: 4 } },
          { word: "despite", coords: { x: 5, y: 5 } },
          { word: "fear", coords: { x: 6, y: 6 } }
        ]
      },
      {
        id: "67f8dec278a9492dbe49a90d", // Our greatest weakness lies in giving up The most certain way to succeed is always to try just one more time
        language: "en",
        level: "7x7-hard",
        newWords: [
          { word: "Change", coords: { x: 0, y: 0 } },
          { word: "difficult", coords: { x: 1, y: 1 } },
          { word: "first", coords: { x: 2, y: 2 } },
          { word: "messy", coords: { x: 3, y: 3 } },
          { word: "middle", coords: { x: 4, y: 4 } },
          { word: "gorgeous", coords: { x: 5, y: 5 } },
          { word: "end", coords: { x: 6, y: 6 } }
        ]
      },
      {
        id: "67f8dec278a9492dbe49a90e", // Success is not the key to happiness Happiness is the key to success If you love what you do you will succeed
        language: "en",
        level: "7x7-hard",
        newWords: [
          { word: "Journey", coords: { x: 0, y: 0 } },
          { word: "thousand", coords: { x: 1, y: 1 } },
          { word: "miles", coords: { x: 2, y: 2 } },
          { word: "begins", coords: { x: 3, y: 3 } },
          { word: "single", coords: { x: 4, y: 4 } },
          { word: "step", coords: { x: 5, y: 5 } },
          { word: "forward", coords: { x: 6, y: 6 } }
        ]
      },
      {
        id: "67f8dec278a9492dbe49a90f", // What you get by achieving your goals is not as important as what you become by achieving goals
        language: "en",
        level: "7x7-hard",
        newWords: [
          { word: "Everything", coords: { x: 0, y: 0 } },
          { word: "seems", coords: { x: 1, y: 1 } },
          { word: "impossible", coords: { x: 2, y: 2 } },
          { word: "until", coords: { x: 3, y: 3 } },
          { word: "someone", coords: { x: 4, y: 4 } },
          { word: "does", coords: { x: 5, y: 5 } },
          { word: "it", coords: { x: 6, y: 6 } }
        ]
      },
      {
        id: "67f8dec278a9492dbe49a910", // Life is not measured by the number of breaths we take but by the moments that take our breath away
        language: "en",
        level: "7x7-hard",
        newWords: [
          { word: "Kindness", coords: { x: 0, y: 0 } },
          { word: "makes", coords: { x: 1, y: 1 } },
          { word: "world", coords: { x: 2, y: 2 } },
          { word: "place", coords: { x: 3, y: 3 } },
          { word: "worth", coords: { x: 4, y: 4 } },
          { word: "living", coords: { x: 5, y: 5 } },
          { word: "in", coords: { x: 6, y: 6 } }
        ]
      },
      {
        id: "67f8dec278a9492dbe49a911", // The difference between a successful person and others is not a lack of strength not a lack of knowledge but rather a lack of will
        language: "en",
        level: "7x7-hard",
        newWords: [
          { word: "Mountains", coords: { x: 0, y: 0 } },
          { word: "exist", coords: { x: 1, y: 1 } },
          { word: "only", coords: { x: 2, y: 2 } },
          { word: "when", coords: { x: 3, y: 3 } },
          { word: "viewed", coords: { x: 4, y: 4 } },
          { word: "ground", coords: { x: 5, y: 5 } },
          { word: "level", coords: { x: 6, y: 6 } }
        ]
      },
      {
        id: "67f8dec278a9492dbe49a912", // If you want to go fast go alone If you want to go far go together with others who share your vision
        language: "en",
        level: "7x7-hard",
        newWords: [
          { word: "Dream", coords: { x: 0, y: 0 } },
          { word: "big", coords: { x: 1, y: 1 } },
          { word: "start", coords: { x: 2, y: 2 } },
          { word: "small", coords: { x: 3, y: 3 } },
          { word: "act", coords: { x: 4, y: 4 } },
          { word: "now", coords: { x: 5, y: 5 } },
          { word: "today", coords: { x: 6, y: 6 } }
        ]
      },
      {
        id: "67f8dfc3db50e5f6733ff554", // Ideas with no use stay just dreams with no real gain
        language: "en",
        level: "7x7-hard",
        newWords: [
          { word: "Knowledge", coords: { x: 0, y: 0 } },
          { word: "speaks", coords: { x: 1, y: 1 } },
          { word: "but", coords: { x: 2, y: 2 } },
          { word: "wisdom", coords: { x: 3, y: 3 } },
          { word: "listens", coords: { x: 4, y: 4 } },
          { word: "carefully", coords: { x: 5, y: 5 } },
          { word: "always", coords: { x: 6, y: 6 } }
        ]
      },
      {
        id: "67f8dfc3db50e5f6733ff55d", // Who we are shows in what we do when times get tough
        language: "en",
        level: "7x7-hard",
        newWords: [
          { word: "Patience", coords: { x: 0, y: 0 } },
          { word: "bitter", coords: { x: 1, y: 1 } },
          { word: "but", coords: { x: 2, y: 2 } },
          { word: "fruit", coords: { x: 3, y: 3 } },
          { word: "sweet", coords: { x: 4, y: 4 } },
          { word: "lasting", coords: { x: 5, y: 5 } },
          { word: "forever", coords: { x: 6, y: 6 } }
        ]
      },
      {
        id: "67f8dfc3db50e5f6733ff55e", // Joy comes from your soul not from what you now own
        language: "en",
        level: "7x7-hard",
        newWords: [
          { word: "Quality", coords: { x: 0, y: 0 } },
          { word: "never", coords: { x: 1, y: 1 } },
          { word: "accident", coords: { x: 2, y: 2 } },
          { word: "always", coords: { x: 3, y: 3 } },
          { word: "result", coords: { x: 4, y: 4 } },
          { word: "intelligent", coords: { x: 5, y: 5 } },
          { word: "effort", coords: { x: 6, y: 6 } }
        ]
      },
      {
        id: "67f8dfc3db50e5f6733ff561", // Grit grows from hard falls not from safe smooth rides
        language: "en",
        level: "7x7-hard",
        newWords: [
          { word: "Happiness", coords: { x: 0, y: 0 } },
          { word: "choice", coords: { x: 1, y: 1 } },
          { word: "requires", coords: { x: 2, y: 2 } },
          { word: "effort", coords: { x: 3, y: 3 } },
          { word: "daily", coords: { x: 4, y: 4 } },
          { word: "practice", coords: { x: 5, y: 5 } },
          { word: "consistently", coords: { x: 6, y: 6 } }
        ]
      }
    ];
    
    let updateCount = 0;
    
    // 각 문서 업데이트 진행
    for (const replacement of replacements) {
      try {
        // content 필드 구성 (새 단어들을 공백으로 연결)
        const newContent = replacement.newWords.map(item => item.word).join(' ');
        
        // 업데이트 작업 실행
        const result = await zengoCollection.updateOne(
          { _id: new ObjectId(replacement.id) },
          { 
            $set: { 
              wordMappings: replacement.newWords,
              content: newContent
            } 
          }
        );
        
        if (result.modifiedCount > 0) {
          console.log(`[성공] ${replacement.id} 문서 업데이트 완료`);
          console.log(`  - 새 내용: ${newContent}`);
          console.log('------------------------------------');
          updateCount++;
        } else {
          console.log(`[실패] ${replacement.id} 문서를 찾을 수 없거나 업데이트되지 않음`);
        }
      } catch (error) {
        console.error(`[오류] ${replacement.id} 업데이트 중 오류 발생:`, error);
      }
    }
    
    console.log(`\n총 ${replacements.length}개 중 ${updateCount}개 문서 업데이트 완료`);
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB 연결 종료');
    }
  }
}

// 스크립트 실행
fixDuplicateWords(); 