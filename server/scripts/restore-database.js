import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

/**
 * Database Restore Script
 * Restores MongoDB from a backup dump
 */

const restoreDatabase = async (backupPath) => {
  try {
    // Get MongoDB URI from environment
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    // Parse database name from URI
    const dbName = mongoUri.split('/').pop().split('?')[0];
    
    // Validate backup path
    if (!backupPath) {
      // List available backups
      const backupDir = path.join(process.cwd(), 'backups');
      if (fs.existsSync(backupDir)) {
        const backups = fs.readdirSync(backupDir)
          .filter(dir => dir.startsWith('backup-'))
          .sort()
          .reverse();
        
        if (backups.length === 0) {
          throw new Error('No backups found in ./backups directory');
        }
        
        console.log('📁 Available backups:');
        backups.forEach((backup, index) => {
          console.log(`  ${index + 1}. ${backup}`);
        });
        
        throw new Error('Please specify backup path as argument: npm run restore -- backup-folder-name');
      } else {
        throw new Error('No backups directory found');
      }
    }

    // Resolve full backup path
    const fullBackupPath = path.isAbsolute(backupPath) 
      ? backupPath 
      : path.join(process.cwd(), 'backups', backupPath);
    
    const dbBackupPath = path.join(fullBackupPath, dbName);
    
    if (!fs.existsSync(dbBackupPath)) {
      throw new Error(`Backup not found: ${dbBackupPath}`);
    }

    console.log('🔄 Starting database restore...');
    console.log(`Database: ${dbName}`);
    console.log(`Restore from: ${dbBackupPath}`);
    
    // Warning prompt
    console.log('⚠️  WARNING: This will REPLACE all data in your database!');
    console.log('   Make sure you have a current backup if needed.');
    
    // Run mongorestore command
    const restoreCommand = `mongorestore --uri="${mongoUri}" --drop "${dbBackupPath}"`;
    
    console.log('⏳ Restoring database (this may take a few minutes)...');
    const { stdout, stderr } = await execAsync(restoreCommand);
    
    if (stderr && !stderr.includes('done restoring')) {
      console.warn('Warning:', stderr);
    }

    console.log('✅ Database restored successfully!');
    console.log(`📊 Restored from: ${fullBackupPath}`);
    
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    
    if (error.message.includes('mongorestore')) {
      console.log('\n💡 Install MongoDB tools:');
      console.log('- Windows: Download from https://www.mongodb.com/try/download/database-tools');
      console.log('- macOS: brew install mongodb/brew/mongodb-database-tools');
      console.log('- Linux: sudo apt-get install mongodb-database-tools');
    }
    
    throw error;
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Load environment variables
  import('dotenv').then(dotenv => {
    dotenv.config();
    
    // Get backup path from command line argument
    const backupPath = process.argv[2];
    restoreDatabase(backupPath);
  });
}