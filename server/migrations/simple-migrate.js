import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../src/config/database.js';
import User from '../src/models/User.js';
import Team from '../src/models/Team.js';
import ProblemStatement from '../src/models/ProblemStatement.js';

// Load environment variables
dotenv.config();

/**
 * Simple Migration Runner
 * Runs migrations without backup (for testing)
 */

const simpleMigrate = async () => {
  console.log('🚀 Simple Migration Runner');
  console.log('Running hackathon feature migrations...\n');
  
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database\n');
    
    // Migration 1: Add participant type
    console.log('📝 Migration 1: Adding participant type...');
    const result1 = await User.updateMany(
      { 
        role: 'participant',
        participantType: { $exists: false }
      },
      { 
        $set: { participantType: 'bootcamp' }
      }
    );
    console.log(`✅ Updated ${result1.modifiedCount} users with participantType: 'bootcamp'\n`);
    
    // Migration 2: Create basic indexes
    console.log('🔍 Migration 2: Creating database indexes...');
    const db = mongoose.connection.db;
    
    // Create only the most important indexes
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ participantType: 1 });
    await db.collection('teams').createIndex({ leader: 1 });
    await db.collection('teams').createIndex({ isActive: 1 });
    
    console.log('✅ Created essential database indexes\n');
    
    // Migration 3: Basic data validation
    console.log('🧹 Migration 3: Basic data validation...');
    
    // Count current state
    const bootcampCount = await User.countDocuments({ 
      role: 'participant', 
      participantType: 'bootcamp' 
    });
    const hackathonCount = await User.countDocuments({ 
      role: 'participant', 
      participantType: 'hackathon' 
    });
    const totalTeams = await Team.countDocuments({ isActive: true });
    const totalProblems = await ProblemStatement.countDocuments({});
    
    console.log('✅ Data validation complete\n');
    
    // Summary
    console.log('=== MIGRATION SUMMARY ===');
    console.log(`Bootcamp Participants: ${bootcampCount}`);
    console.log(`Hackathon Participants: ${hackathonCount}`);
    console.log(`Active Teams: ${totalTeams}`);
    console.log(`Problem Statements: ${totalProblems}`);
    console.log('=========================\n');
    
    console.log('✅ All migrations completed successfully!');
    console.log('🎉 Your database is now ready for hackathon features.');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Full error:', error);
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

// Run migration
simpleMigrate();