import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { backupDatabase } from '../scripts/backup-database.js';
import addParticipantType from './001_add_participant_type.js';
import createIndexes from './002_create_indexes.js';
import validateAndCleanupData from './003_data_validation_cleanup.js';

// Load environment variables
dotenv.config();

/**
 * Safe Migration Runner
 * Creates backup before running migrations
 */

const safeMigrate = async () => {
  console.log('🛡️  Safe Migration Runner');
  console.log('This will backup your database before running migrations.\n');
  
  let backupPath = null;
  
  try {
    // Step 1: Create backup
    console.log('📦 Step 1: Creating database backup...');
    backupPath = await backupDatabase();
    console.log(`✅ Backup created: ${backupPath}\n`);
    
    // Step 2: Run migrations
    console.log('🚀 Step 2: Running migrations...\n');
    
    console.log('📝 Running Migration 1: Add Participant Type');
    await addParticipantType();
    
    console.log('\n🔍 Running Migration 2: Create Database Indexes');
    await createIndexes();
    
    console.log('\n🧹 Running Migration 3: Data Validation and Cleanup');
    await validateAndCleanupData();
    
    console.log('\n✅ All migrations completed successfully!');
    console.log('🎉 Your database is now ready for hackathon features.');
    
    if (backupPath) {
      console.log(`\n💾 Backup available at: ${backupPath}`);
      console.log('   Use "npm run restore -- backup-folder-name" if you need to rollback.');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Full error:', error);
    
    if (backupPath) {
      console.log('\n🔄 You can restore your database using:');
      console.log(`   npm run restore -- ${backupPath.split('/').pop()}`);
    }
    
    process.exit(1);
  } finally {
    // Close database connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed.');
    }
    process.exit(0);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  safeMigrate();
}