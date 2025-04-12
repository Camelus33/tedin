const { MongoClient } = require('mongodb');

async function findDuplicateWords() {
  let client;
  
  try {
    client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    
    const db = client.db('habitus33');
    const zengoCollection = db.collection('zengo');
    
    const documents = await zengoCollection.find({}).toArray();
    console.log(`총 문서 수: ${documents.length}`);
    
    let duplicatesFound = 0;
    const duplicates = [];
    
    // 중복 단어 찾기 함수
    function checkForDuplicates(doc, useWordMappings = true) {
      // 단어 배열 얻기
      let words = [];
      
      // wordMappings에서 단어 추출 (우선적으로 사용)
      if (useWordMappings && doc.wordMappings && Array.isArray(doc.wordMappings)) {
        words = doc.wordMappings.map(mapping => mapping.word).filter(Boolean);
      } 
      // content에서 단어 추출 (백업)
      else if (doc.content) {
        words = doc.content.split(/\s+/).filter(w => w.length > 0);
      }
      
      // 단어가 없으면 건너뛰기
      if (words.length === 0) {
        return null;
      }
      
      // 중복 단어 확인
      const uniqueWords = new Set(words);
      
      if (words.length !== uniqueWords.size) {
        // 중복된 단어 찾기
        const wordCounts = {};
        let duplicateWords = [];
        
        words.forEach(word => {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
          if (wordCounts[word] > 1 && !duplicateWords.includes(word)) {
            duplicateWords.push(word);
          }
        });
        
        return {
          id: doc._id.toString(),
          content: doc.content || '(내용 없음)',
          language: doc.language,
          level: doc.level,
          words: words,
          duplicateWords: duplicateWords,
          source: useWordMappings ? 'wordMappings' : 'content'
        };
      }
      
      return null;
    }
    
    // 모든 문서 분석
    documents.forEach(doc => {
      // wordMappings 기반 중복 단어 확인
      const mappingDuplicate = checkForDuplicates(doc, true);
      if (mappingDuplicate) {
        duplicatesFound++;
        duplicates.push(mappingDuplicate);
        console.log(`중복 단어 문장 [${mappingDuplicate.source}]: ${mappingDuplicate.content} (${doc.language}, ${doc.level})`);
        console.log(`분석된 단어들: ${mappingDuplicate.words.join(', ')}`);
        console.log(`중복 단어: ${mappingDuplicate.duplicateWords.join(', ')}`);
        console.log('-------------------------------------------');
      }
      
      // content 기반 중복 단어 확인 (참고용)
      const contentDuplicate = checkForDuplicates(doc, false);
      if (contentDuplicate && !mappingDuplicate) {
        console.log(`[참고] content에서만 중복 발견: ${contentDuplicate.content} (${doc.language}, ${doc.level})`);
        console.log(`분석된 단어들: ${contentDuplicate.words.join(', ')}`);
        console.log(`중복 단어: ${contentDuplicate.duplicateWords.join(', ')}`);
        console.log('-------------------------------------------');
      }
    });
    
    console.log(`\n중복 단어가 있는 문장 수: ${duplicatesFound}`);
    
    if (duplicatesFound > 0) {
      console.log('\n중복 단어가 있는 문장 목록:');
      console.log(JSON.stringify(duplicates, null, 2));
    } else {
      console.log('\n중복 단어가 있는 문장이 없습니다.');
    }
    
    // 한글 문장만 따로 분석
    console.log('\n한글 문장에 대한 추가 분석:');
    const koreanDocs = documents.filter(doc => doc.language === 'ko');
    console.log(`한글 문서 수: ${koreanDocs.length}`);
    
    // wordMappings 구조 확인
    const docWithMappings = documents.find(doc => doc.wordMappings && doc.wordMappings.length > 0);
    if (docWithMappings) {
      console.log('\nwordMappings 예시:');
      console.log(JSON.stringify(docWithMappings.wordMappings, null, 2));
      console.log(`문장: ${docWithMappings.content}`);
    }
    
    // "산" 단어가 포함된 한글 문장 찾기
    const mountainDocs = koreanDocs.filter(doc => doc.content && doc.content.includes('산'));
    console.log(`\n"산" 단어 포함 문장 수: ${mountainDocs.length}`);
    
    if (mountainDocs.length > 0) {
      mountainDocs.forEach(doc => {
        console.log(`- ${doc.content} (${doc.level})`);
        // 해당 문장의 wordMappings 확인
        if (doc.wordMappings && Array.isArray(doc.wordMappings)) {
          const containsSan = doc.wordMappings.some(mapping => mapping.word === '산');
          if (containsSan) {
            console.log(`  * wordMappings에 '산' 단어 포함됨`);
            // 추가로 '산' 단어가 여러번 등장하는지 확인
            const sanCount = doc.wordMappings.filter(mapping => mapping.word === '산').length;
            if (sanCount > 1) {
              console.log(`  * '산' 단어가 ${sanCount}번 중복 등장`);
            }
          }
        }
      });
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

findDuplicateWords(); 