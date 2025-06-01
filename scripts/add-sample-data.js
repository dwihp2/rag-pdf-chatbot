#!/usr/bin/env node

// Add sample data for testing
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const dbPath = path.join(process.cwd(), 'chat_history.db');
const db = new Database(dbPath);

try {
  console.log('🎯 Adding sample data for testing...');

  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Create sample chats
  const insertChat = db.prepare(`
    INSERT INTO chats (id, title, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `);

  const insertMessage = db.prepare(`
    INSERT INTO messages (id, chat_id, role, content, sources, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    // Chat 1: Recent chat about PDF analysis
    const chat1Id = uuidv4();
    insertChat.run(chat1Id, 'PDF Document Analysis', yesterday, now);
    
    insertMessage.run(
      uuidv4(),
      chat1Id,
      'user',
      'Can you analyze the quarterly report I uploaded?',
      null,
      yesterday
    );
    
    insertMessage.run(
      uuidv4(),
      chat1Id,
      'assistant',
      'I\'d be happy to help analyze your quarterly report. I can see information about revenue trends, key metrics, and strategic initiatives mentioned in the document.',
      JSON.stringify([
        { filename: 'quarterly_report.pdf', page: 1, text: 'Revenue increased by 15% compared to last quarter...', score: 0.92 },
        { filename: 'quarterly_report.pdf', page: 3, text: 'Key strategic initiatives include digital transformation...', score: 0.88 }
      ]),
      yesterday
    );

    insertMessage.run(
      uuidv4(),
      chat1Id,
      'user',
      'What are the main financial highlights?',
      null,
      now
    );

    // Chat 2: Chat about research paper
    const chat2Id = uuidv4();
    insertChat.run(chat2Id, 'Research Paper Discussion', yesterday, yesterday);
    
    insertMessage.run(
      uuidv4(),
      chat2Id,
      'user',
      'Summarize the methodology section of this research paper',
      null,
      yesterday
    );
    
    insertMessage.run(
      uuidv4(),
      chat2Id,
      'assistant',
      'Based on the research paper, the methodology involves a mixed-methods approach combining quantitative surveys with qualitative interviews to gather comprehensive data.',
      JSON.stringify([
        { filename: 'research_paper.pdf', page: 5, text: 'The study employed a mixed-methods design...', score: 0.95 }
      ]),
      yesterday
    );

    // Chat 3: Empty chat (just created)
    const chat3Id = uuidv4();
    insertChat.run(chat3Id, 'New Chat', now, now);
  });

  transaction();

  console.log('✅ Sample data added successfully!');
  console.log('   - 3 sample chats created');
  console.log('   - 5 messages added');
  console.log('   - 1 empty chat for testing');

} catch (error) {
  console.error('❌ Error adding sample data:', error);
} finally {
  db.close();
}
