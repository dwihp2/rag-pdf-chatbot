const { vectorService } = require('../dist/src/lib/vector-service.js');
const { prisma } = require('../dist/src/lib/database.js');

async function testPgvectorSetup() {
  console.log('🧪 Testing pgvector setup...\n');

  try {
    // Test 1: Check database connection
    console.log('1️⃣ Testing database connection...');
    const documentCount = await prisma.document.count();
    console.log(`✅ Database connected. Documents: ${documentCount}\n`);

    // Test 2: Test embedding generation
    console.log('2️⃣ Testing embedding generation...');
    const testQuery = "What is artificial intelligence?";
    const embedding = await vectorService.generateQueryEmbedding(testQuery);
    console.log(`✅ Generated embedding with ${embedding.length} dimensions\n`);

    // Test 3: Test vector service stats
    console.log('3️⃣ Testing vector service stats...');
    const stats = await vectorService.getStats();
    console.log('✅ Vector service stats:', stats);

    console.log('\n🎉 All tests passed! pgvector setup is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPgvectorSetup();
