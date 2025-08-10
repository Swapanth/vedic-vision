import addParticipantType from './001_add_participant_type.js';
import createIndexes from './002_create_indexes.js';
import validateAndCleanupData from './003_data_validation_cleanup.js';

/**
 * Migration Runner
 * Runs all migrations in sequence
 */

const runAllMigrations = async () => {
  console.log('🚀 Starting database migrations...\n');
  
  try {
    console.log('📝 Running Migration 1: Add Participant Type');
    await addParticipantType();
    
    console.log('\n🔍 Running Migration 2: Create Database Indexes');
    await createIndexes();
    
    console.log('\n🧹 Running Migration 3: Data Validation and Cleanup');
    await validateAndCleanupData();
    
    console.log('\n✅ All migrations completed successfully!');
    console.log('Your database is now ready for the hackathon features.');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllMigrations();
}