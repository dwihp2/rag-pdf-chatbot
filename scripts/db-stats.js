#!/usr/bin/env node

// Database statistics and maintenance script
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'chat_history.db');

if (!require('fs').existsSync(dbPath)) {
  console.log('❌ Database file not found. Run the app first to create it.');
  process.exit(1);
}

const db = new Database(dbPath);

try {
  console.log('📊 Database Statistics');
  console.log('='.repeat(50));

  // Get basic counts
  const chatCount = db.prepare('SELECT COUNT(*) as count FROM chats').get();
  const messageCount = db.prepare('SELECT COUNT(*) as count FROM messages').get();

  console.log(`Total Chats: ${chatCount.count}`);
  console.log(`Total Messages: ${messageCount.count}`);

  if (chatCount.count > 0) {
    // Get recent chats
    const recentChats = db.prepare(`
      SELECT 
        id, 
        title, 
        created_at, 
        updated_at,
        (SELECT COUNT(*) FROM messages WHERE chat_id = chats.id) as message_count
      FROM chats 
      ORDER BY updated_at DESC 
      LIMIT 10
    `).all();

    console.log('\n📝 Recent Chats:');
    console.log('-'.repeat(50));
    recentChats.forEach((chat, index) => {
      const date = new Date(chat.updated_at).toLocaleDateString();
      console.log(`${index + 1}. "${chat.title}" (${chat.message_count} messages) - ${date}`);
    });

    // Get message statistics
    const userMessages = db.prepare('SELECT COUNT(*) as count FROM messages WHERE role = "user"').get();
    const assistantMessages = db.prepare('SELECT COUNT(*) as count FROM messages WHERE role = "assistant"').get();

    console.log('\n💬 Message Breakdown:');
    console.log('-'.repeat(50));
    console.log(`User Messages: ${userMessages.count}`);
    console.log(`Assistant Messages: ${assistantMessages.count}`);

    // Get database size
    const stats = require('fs').statSync(dbPath);
    const fileSizeInBytes = stats.size;
    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);

    console.log('\n💾 Storage Information:');
    console.log('-'.repeat(50));
    console.log(`Database File Size: ${fileSizeInMB} MB`);
    console.log(`Database Location: ${dbPath}`);

    // Check for empty chats
    const emptyChats = db.prepare(`
      SELECT COUNT(*) as count 
      FROM chats 
      WHERE id NOT IN (SELECT DISTINCT chat_id FROM messages)
    `).get();

    if (emptyChats.count > 0) {
      console.log(`\n⚠️  Empty Chats: ${emptyChats.count} (chats with no messages)`);
    }
  }

  console.log('\n✅ Database analysis complete');

} catch (error) {
  console.error('❌ Error analyzing database:', error);
} finally {
  db.close();
}
