import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Submission from './src/models/Submission.js';
import Attendance from './src/models/Attendance.js';

// Load environment variables
dotenv.config();

const recalculateAllScores = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all active users
    const users = await User.find({ isActive: true });
    console.log(`Found ${users.length} active users`);

    let updated = 0;
    for (const user of users) {
      try {
        const oldScore = user.totalScore;
        await user.updateTotalScore();
        console.log(`Updated ${user.name} (${user.email}): ${oldScore} → ${user.totalScore} points`);
        updated++;
      } catch (error) {
        console.error(`Error updating score for ${user.name}:`, error.message);
      }
    }

    console.log(`\nScore recalculation completed!`);
    console.log(`Successfully updated ${updated} out of ${users.length} users`);

  } catch (error) {
    console.error('Error recalculating scores:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
recalculateAllScores();