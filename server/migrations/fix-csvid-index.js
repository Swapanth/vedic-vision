import mongoose from 'mongoose';
import ProblemStatement from '../src/models/ProblemStatement.js';

const fixCsvIdIndex = async () => {
  try {
    console.log('Starting csvId index fix...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon');
    
    // Drop the existing csvId index
    try {
      await ProblemStatement.collection.dropIndex('csvId_1');
      console.log('Dropped existing csvId index');
    } catch (error) {
      console.log('Index may not exist or already dropped:', error.message);
    }
    
    // Remove csvId field from all custom problem statements (where csvId is null)
    const result = await ProblemStatement.updateMany(
      { isCustom: true, csvId: null },
      { $unset: { csvId: 1 } }
    );
    
    console.log(`Updated ${result.modifiedCount} custom problem statements`);
    
    // Recreate the index with proper sparse configuration
    await ProblemStatement.collection.createIndex(
      { csvId: 1 }, 
      { 
        unique: true, 
        sparse: true,
        background: true 
      }
    );
    
    console.log('Recreated csvId index with proper sparse configuration');
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run the migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixCsvIdIndex();
}

export default fixCsvIdIndex;