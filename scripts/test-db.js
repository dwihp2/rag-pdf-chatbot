#!/usr/bin/env node

// Simple script to test the database setup
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

console.log('🧪 Testing SQLite database setup...');

// Create database in the project root for development
const dbPath = path.join(process.cwd(), 'chat_history.db');
console.log(`📁 Database path: ${dbPath}`);

const db = new Database(dbPath);

try {
  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      chat_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      sources TEXT, -- JSON string
      created_at TEXT NOT NULL,
      FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages (chat_id);
    CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at);
    CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats (updated_at);
  `);

  console.log('✅ Database tables created successfully');

  // Test creating a sample chat
  const chatId = uuidv4();
  const now = new Date().toISOString();

  const insertChat = db.prepare(`
    INSERT INTO chats (id, title, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `);

  insertChat.run(chatId, 'Test Chat', now, now);
  console.log('✅ Sample chat created');

  // Test creating sample messages
  const insertMessage = db.prepare(`
    INSERT INTO messages (id, chat_id, role, content, sources, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const messageId1 = uuidv4();
  const messageId2 = uuidv4();

  insertMessage.run(messageId1, chatId, 'user', 'Hello, can you help me with my PDF?', null, now);
  insertMessage.run(messageId2, chatId, 'assistant', 'Of course! I can help you analyze your PDF documents. Please upload your PDF and ask me any questions about its content.', null, now);

  console.log('✅ Sample messages created');

  // Test querying data
  const chats = db.prepare('SELECT * FROM chats ORDER BY updated_at DESC').all();
  const messages = db.prepare('SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC').all(chatId);

  console.log('📊 Database Stats:');
  console.log(`   - Total chats: ${chats.length}`);
  console.log(`   - Total messages: ${messages.length}`);
  console.log(`   - Sample chat title: "${chats[0]?.title}"`);
  
  // Clean up test data
  db.prepare('DELETE FROM messages WHERE chat_id = ?').run(chatId);
  db.prepare('DELETE FROM chats WHERE id = ?').run(chatId);
  console.log('🧹 Cleaned up test data');

  console.log('🎉 Database test completed successfully!');

} catch (error) {
  console.error('❌ Database test failed:', error);
} finally {
  db.close();
  console.log('🔒 Database connection closed');
}
