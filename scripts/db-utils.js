#!/usr/bin/env node

// Database backup and export script
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'chat_history.db');

if (!fs.existsSync(dbPath)) {
  console.log('❌ Database file not found. Run the app first to create it.');
  process.exit(1);
}

const action = process.argv[2];

if (!action || !['backup', 'export', 'import', 'clean'].includes(action)) {
  console.log('Usage: node scripts/db-utils.js <action>');
  console.log('Actions:');
  console.log('  backup  - Create a backup copy of the database');
  console.log('  export  - Export data to JSON format');
  console.log('  import  - Import data from JSON format');
  console.log('  clean   - Remove empty chats and old data');
  process.exit(1);
}

const db = new Database(dbPath);

try {
  switch (action) {
    case 'backup':
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `chat_history_backup_${timestamp}.db`;
      
      // Create backup
      const backup = db.backup(backupPath);
      backup.step(-1); // Copy entire database
      backup.finish();
      
      console.log(`✅ Database backed up to: ${backupPath}`);
      break;

    case 'export':
      console.log('📤 Exporting database to JSON...');
      
      const chats = db.prepare('SELECT * FROM chats ORDER BY created_at').all();
      const messages = db.prepare('SELECT * FROM messages ORDER BY created_at').all();
      
      const exportData = {
        exported_at: new Date().toISOString(),
        version: '1.0',
        chats,
        messages
      };
      
      const exportPath = `chat_export_${new Date().toISOString().split('T')[0]}.json`;
      fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
      
      console.log(`✅ Data exported to: ${exportPath}`);
      console.log(`   - ${chats.length} chats`);
      console.log(`   - ${messages.length} messages`);
      break;

    case 'clean':
      console.log('🧹 Cleaning up database...');
      
      // Remove empty chats
      const emptyChats = db.prepare(`
        DELETE FROM chats 
        WHERE id NOT IN (SELECT DISTINCT chat_id FROM messages)
      `);
      const deletedChats = emptyChats.run();
      
      // Vacuum database to reclaim space
      db.exec('VACUUM');
      
      console.log(`✅ Cleanup complete:`);
      console.log(`   - Removed ${deletedChats.changes} empty chats`);
      console.log(`   - Database optimized (VACUUM)`);
      break;

    case 'import':
      const importFile = process.argv[3];
      if (!importFile) {
        console.log('❌ Please specify import file: node scripts/db-utils.js import <file.json>');
        process.exit(1);
      }
      
      if (!fs.existsSync(importFile)) {
        console.log(`❌ Import file not found: ${importFile}`);
        process.exit(1);
      }
      
      console.log(`📥 Importing data from: ${importFile}`);
      
      const importData = JSON.parse(fs.readFileSync(importFile, 'utf8'));
      
      // Clear existing data (optional - comment out to append)
      // db.exec('DELETE FROM messages; DELETE FROM chats;');
      
      // Import chats
      const insertChat = db.prepare(`
        INSERT OR REPLACE INTO chats (id, title, created_at, updated_at)
        VALUES (?, ?, ?, ?)
      `);
      
      // Import messages
      const insertMessage = db.prepare(`
        INSERT OR REPLACE INTO messages (id, chat_id, role, content, sources, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const transaction = db.transaction(() => {
        for (const chat of importData.chats) {
          insertChat.run(chat.id, chat.title, chat.created_at, chat.updated_at);
        }
        
        for (const message of importData.messages) {
          insertMessage.run(
            message.id,
            message.chat_id,
            message.role,
            message.content,
            message.sources,
            message.created_at
          );
        }
      });
      
      transaction();
      
      console.log(`✅ Import complete:`);
      console.log(`   - Imported ${importData.chats.length} chats`);
      console.log(`   - Imported ${importData.messages.length} messages`);
      break;
  }

} catch (error) {
  console.error(`❌ Error during ${action}:`, error);
} finally {
  db.close();
}
