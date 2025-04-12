const { MongoClient } = require('mongodb');

async function findLongEnglishWords() {
  let client;
  
  try {
    client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    
    const db = client.db('habitus33');
    const zengoCollection = db.collection('zengo');
    
    // 영어 문장만 가져오기
    const englishDocs = await zengoCollection.find({ language: 'en' }).toArray();
    console.log(`영어 문서 수: ${englishDocs.length}`);
    
    let longWordsCount = 0;
    const docsWithLongWords = [];
    
    // 각 문서에서 8철자 이상 단어 찾기
    englishDocs.forEach(doc => {
      // wordMappings에서 단어 추출
      if (doc.wordMappings && Array.isArray(doc.wordMappings)) {
        const longWords = [];
        
        doc.wordMappings.forEach(mapping => {
          if (mapping.word && mapping.word.length >= 8) {
            longWords.push({
              word: mapping.word,
              length: mapping.word.length,
              coords: mapping.coords
            });
          }
        });
        
        if (longWords.length > 0) {
          longWordsCount += longWords.length;
          docsWithLongWords.push({
            id: doc._id.toString(),
            content: doc.content || '(내용 없음)',
            level: doc.level,
            words: doc.wordMappings.map(m => m.word),
            longWords: longWords
          });
        }
      }
    });
    
    console.log(`\n8철자 이상의 영어 단어를 포함한 문장 수: ${docsWithLongWords.length}`);
    console.log(`총 발견된 8철자 이상 단어 수: ${longWordsCount}`);
    
    if (docsWithLongWords.length > 0) {
      console.log('\n8철자 이상 단어를 포함한 문장 목록:');
      docsWithLongWords.forEach(doc => {
        console.log(`\n[${doc.level}] ${doc.content}`);
        console.log(`ID: ${doc.id}`);
        console.log(`모든 단어: ${doc.words.join(', ')}`);
        console.log(`긴 단어들:`);
        doc.longWords.forEach(word => {
          console.log(`  - "${word.word}" (${word.length}자, 위치: x=${word.coords.x}, y=${word.coords.y})`);
        });
      });
      
      // 교체 가능한 단어 제안
      console.log('\n\n긴 단어 교체 제안:');
      const replacementSuggestions = {
        'excellent': 'great',
        'happiness': 'joy',
        'eventually': 'finally',
        'beautiful': 'lovely',
        'important': 'vital',
        'impossible': 'hard',
        'difference': 'change',
        'intelligence': 'wisdom',
        'carefully': 'with care',
        'knowledge': 'wisdom',
        'consistently': 'always',
        'disappoint': 'let down',
        'intelligent': 'smart',
        'successful': 'winning'
      };
      
      Object.entries(replacementSuggestions).forEach(([word, replacement]) => {
        console.log(`"${word}" (${word.length}자) → "${replacement}" (${replacement.length}자)`);
      });
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\nMongoDB 연결 종료');
    }
  }
}

findLongEnglishWords(); 