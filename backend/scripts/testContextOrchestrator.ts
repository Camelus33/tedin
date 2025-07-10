// Test script for the updated ContextOrchestrator with real SPARQL queries
import { ContextOrchestrator } from '../src/services/ContextOrchestrator';
import { IUser } from '../src/models/User';

const testUser = {
  email: 'test@habitus33.com',
  passwordHash: 'hashedpassword',
  nickname: 'testuser',
  trialEndsAt: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
  roles: ['user'],
  createdAt: new Date(),
  preferences: {}
} as IUser;

async function testContextOrchestrator() {
  console.log('🧪 Testing ContextOrchestrator with real SPARQL queries...\n');
  
  const orchestrator = new ContextOrchestrator(testUser);
  
  // Test cases with different concepts
  const testConcepts = ['공기', '나무', '허균', '거시경제', '낙타'];
  
  for (const concept of testConcepts) {
    console.log(`\n📝 Testing concept: "${concept}"`);
    console.log('=' + '='.repeat(50));
    
    try {
      const startTime = Date.now();
      const contextBundle = await orchestrator.getContextBundle(concept);
      const endTime = Date.now();
      
      console.log(`✅ Query completed in ${endTime - startTime}ms`);
      console.log(`📊 Results summary:`);
      console.log(`   - Notes found: ${contextBundle.relevantNotes.length}`);
      console.log(`   - Book excerpts: ${contextBundle.bookExcerpts?.length || 0}`);
      console.log(`   - Related concepts: ${contextBundle.relatedConcepts?.length || 0}`);
      console.log(`   - Total results: ${contextBundle.queryMetadata?.resultCount || 0}`);
      
      if (contextBundle.relevantNotes.length > 0) {
        console.log(`\n📄 Sample note content:`);
        const firstNote = contextBundle.relevantNotes[0] as any;
        console.log(`   "${firstNote.content.substring(0, 100)}..."`);
        console.log(`   Tags: [${firstNote.tags.join(', ')}]`);
        if (firstNote.relevanceScore !== undefined) {
          console.log(`   Relevance Score: ${firstNote.relevanceScore}`);
        }
      }
      
      if (contextBundle.bookExcerpts && contextBundle.bookExcerpts.length > 0) {
        console.log(`\n📚 Sample book excerpt:`);
        console.log(`   "${contextBundle.bookExcerpts[0]}"`);
      }
      
      if (contextBundle.relatedConcepts && contextBundle.relatedConcepts.length > 0) {
        console.log(`\n🔗 Related concepts: ${contextBundle.relatedConcepts.slice(0, 5).join(', ')}`);
      }
      
    } catch (error: any) {
      console.error(`❌ Error testing concept "${concept}":`, error.message);
    }
  }
  
  console.log('\n🎉 ContextOrchestrator testing completed!');
}

// Run the test
testContextOrchestrator()
  .then(() => {
    console.log('\n✅ All tests completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }); 