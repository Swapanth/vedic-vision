import mongoose from 'mongoose';
import User from '../src/models/User.js';
import connectDB from '../src/config/database.js';

/**
 * Migration: Add participantType field to existing users
 * This ensures all existing users have the participantType field set to 'bootcamp' by default
 */

const migrateParticipantType = async (standalone = false) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    
    console.log('Starting participant type migration...');
    
    // Update all existing users without participantType to have 'bootcamp' as default
    const result = await User.updateMany(
      { 
        role: 'participant',
        participantType: { $exists: false }
      },
      { 
        $set: { participantType: 'bootcamp' }
      }
    );
    
    console.log(`Updated ${result.modifiedCount} users with participantType: 'bootcamp'`);
    
    // Verify the migration
    const bootcampCount = await User.countDocuments({ 
      role: 'participant', 
      participantType: 'bootcamp' 
    });
    const hackathonCount = await User.countDocuments({ 
      role: 'participant', 
      participantType: 'hackathon' 
    });
    
    console.log(`Migration complete:`);
    console.log(`- Bootcamp participants: ${bootcampCount}`);
    console.log(`- Hackathon participants: ${hackathonCount}`);
    
    return { bootcampCount, hackathonCount, modifiedCount: result.modifiedCount };
    
  } catch (error) {
    console.error('Migration failed:', error);
    if (standalone) {
      process.exit(1);
    }
    throw error;
  } finally {
    if (standalone) {
      await mongoose.connection.close();
      process.exit(0);
    }
  }
};

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateParticipantType(true);
}

export default migrateParticipantType;