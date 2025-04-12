const { MongoClient, ObjectId } = require('mongodb');

async function fixRemainingLongWords() {
  let client;
  
  try {
    client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    
    const db = client.db('habitus33');
    const zengoCollection = db.collection('zengo');
    
    // 수정해야 할 문서 목록 (ID와 대체할 단어 매핑 정의)
    const replacements = [
      {
        id: "67f8dec278a9492dbe49a909",
        wordReplacements: {
          'in peace': 'calmly',
          'not have': 'avoid'
        }
      },
      {
        id: "67f8dec278a9492dbe49a90a",
        wordReplacements: {
          'each one': 'all'
        }
      },
      {
        id: "67f8dec278a9492dbe49a90b",
        wordReplacements: {
          'enduring': 'steady',
          'going on': 'moving'
        }
      },
      {
        id: "67f8dec278a9492dbe49a90f",
        wordReplacements: {
          'not easy': 'hard'
        }
      },
      {
        id: "67f8dec278a9492dbe49a918",
        wordReplacements: {
          'know-how': 'skill'
        }
      },
      {
        id: "67f8dec278a9492dbe49a919",
        wordReplacements: {
          'each one': 'all',
          'as one': 'united'
        }
      },
      {
        id: "67f8dfc3db50e5f6733ff554",
        wordReplacements: {
          'with care': 'well'
        }
      },
      {
        id: "67f8dfc3db50e5f6733ff561",
        wordReplacements: {
          'Happiness': 'Joy'
        }
      }
    ];
    
    let updateCount = 0;
    
    // 각 문서 업데이트 진행
    for (const replacement of replacements) {
      try {
        // 문서 조회
        const doc = await zengoCollection.findOne({ _id: new ObjectId(replacement.id) });
        
        if (!doc || !doc.wordMappings || !Array.isArray(doc.wordMappings)) {
          console.log(`[실패] ${replacement.id} 문서를 찾을 수 없거나 wordMappings가 없음`);
          continue;
        }
        
        // wordMappings 업데이트
        const updatedWordMappings = doc.wordMappings.map(mapping => {
          const updatedMapping = { ...mapping };
          
          if (mapping.word && replacement.wordReplacements[mapping.word]) {
            updatedMapping.word = replacement.wordReplacements[mapping.word];
          }
          
          return updatedMapping;
        });
        
        // 새 content 생성
        const newContent = updatedWordMappings.map(m => m.word).join(' ');
        
        // 업데이트 실행
        const result = await zengoCollection.updateOne(
          { _id: new ObjectId(replacement.id) },
          { 
            $set: { 
              wordMappings: updatedWordMappings,
              content: newContent
            } 
          }
        );
        
        if (result.modifiedCount > 0) {
          console.log(`[성공] ${replacement.id} 문서 업데이트 완료`);
          console.log(`  - 원본: ${doc.content || '(내용 없음)'}`);
          console.log(`  - 새 내용: ${newContent}`);
          console.log('------------------------------------');
          updateCount++;
        } else {
          console.log(`[실패] ${replacement.id} 문서가 업데이트되지 않음`);
        }
      } catch (error) {
        console.error(`[오류] ${replacement.id} 업데이트 중 오류 발생:`, error);
      }
    }
    
    console.log(`\n총 ${updateCount}개 문서 업데이트 완료`);
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB 연결 종료');
    }
  }
}

fixRemainingLongWords(); 