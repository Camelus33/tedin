const { MongoClient, ObjectId } = require('mongodb');

async function fixLongEnglishWords() {
  let client;
  
  try {
    client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    
    const db = client.db('habitus33');
    const zengoCollection = db.collection('zengo');
    
    // 긴 단어 대체 매핑
    const wordReplacements = {
      // 3x3-easy
      'Knowledge': 'Wisdom',
      'Practice': 'Train',
      'believing': 'trust',
      'Curiosity': 'Wonder',
      
      // 5x5-medium
      'Cleanliness': 'Clean',
      'godliness': 'holy',
      'Necessity': 'Need',
      'invention': 'create',
      'eventually': 'at last',
      'together': 'as one',
      
      // 7x7-hard
      'harmoniously': 'in peace',
      'alongside': 'with',
      'siblings': 'kin',
      'avoiding': 'not have',
      'destruction': 'ruin',
      'Eventually': 'At last',
      'everyone': 'all',
      'remembers': 'recalls',
      'achievement': 'success',
      'persevering': 'enduring',
      'failures': 'fails',
      'continuing': 'going on',
      'progress': 'gain',
      'difficult': 'hard',
      'gorgeous': 'lovely',
      'thousand': 'many',
      'Everything': 'All',
      'impossible': 'not easy',
      'Kindness': 'Care',
      'Mountains': 'Hills',
      'attempted': 'tried',
      'completely': 'fully',
      'Greatest': 'Best',
      'involves': 'needs',
      'successful': 'winning',
      'possible': 'doable',
      'Achievements': 'Wins',
      'satisfaction': 'joy',
      'meaningful': 'vital',
      'happiness': 'joy',
      'Personal': 'Own',
      'existence': 'being',
      'counting': 'noting',
      'superficial': 'surface',
      'achievements': 'wins',
      'Successful': 'Winning',
      'determination': 'will',
      'knowledge': 'know-how',
      'strategies': 'plans',
      'perseverance': 'grit',
      'achieves': 'gets',
      'traveling': 'going',
      'together': 'as one',
      'everyone': 'each one',
      'Champions': 'Winners',
      'endurance': 'grit',
      'carefully': 'with care',
      'Patience': 'Waiting',
      'accident': 'mishap',
      'intelligent': 'smart',
      'thoughts': 'ideas',
      'requires': 'needs',
      'practice': 'train',
      'consistently': 'always'
    };
    
    // 교체가 필요한 문서 처리
    let updateCount = 0;
    
    // 모든 영어 문서 가져오기
    const englishDocs = await zengoCollection.find({ language: 'en' }).toArray();
    
    for (const doc of englishDocs) {
      if (!doc.wordMappings || !Array.isArray(doc.wordMappings)) {
        continue; // wordMappings가 없는 문서는 건너뛰기
      }
      
      let hasLongWord = false;
      let needsUpdate = false;
      const updatedWordMappings = [];
      
      for (const mapping of doc.wordMappings) {
        // 깊은 복사를 위해 새 객체 생성
        const updatedMapping = {
          word: mapping.word,
          coords: { ...mapping.coords }
        };
        
        // 단어 길이 체크
        if (mapping.word && mapping.word.length >= 8) {
          hasLongWord = true;
          
          // 대체 단어가 있는지 확인
          if (wordReplacements[mapping.word]) {
            updatedMapping.word = wordReplacements[mapping.word];
            needsUpdate = true;
          }
        }
        
        updatedWordMappings.push(updatedMapping);
      }
      
      // 긴 단어가 있고 업데이트가 필요한 경우에만 DB 업데이트
      if (hasLongWord && needsUpdate) {
        // 새 content 생성 (단어들을 공백으로 연결)
        const newContent = updatedWordMappings.map(m => m.word).join(' ');
        
        try {
          const result = await zengoCollection.updateOne(
            { _id: doc._id },
            { 
              $set: { 
                wordMappings: updatedWordMappings,
                content: newContent
              } 
            }
          );
          
          if (result.modifiedCount > 0) {
            console.log(`[성공] ${doc._id} 문서 업데이트 완료`);
            console.log(`  - 원본: ${doc.content || '(내용 없음)'}`);
            console.log(`  - 새 내용: ${newContent}`);
            console.log('------------------------------------');
            updateCount++;
          } else {
            console.log(`[실패] ${doc._id} 문서를 찾을 수 없거나 업데이트되지 않음`);
          }
        } catch (error) {
          console.error(`[오류] ${doc._id} 업데이트 중 오류 발생:`, error);
        }
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

fixLongEnglishWords(); 