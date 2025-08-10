import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const debugCsvIdIssue = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('problemstatements');

    // Check all documents and their csvId values
    console.log('\n=== Analyzing all problem statements ===');
    const allProblems = await collection.find({}).toArray();
    console.log(`Total documents: ${allProblems.length}`);

    // Group by csvId values
    const csvIdGroups = {};
    allProblems.forEach(doc => {
      const csvIdValue = doc.csvId === undefined ? 'undefined' : 
                        doc.csvId === null ? 'null' : 
                        doc.csvId;
      
      if (!csvIdGroups[csvIdValue]) {
        csvIdGroups[csvIdValue] = [];
      }
      csvIdGroups[csvIdValue].push(doc._id);
    });

    console.log('\n=== CsvId distribution ===');
    Object.keys(csvIdGroups).forEach(key => {
      console.log(`csvId: ${key} -> ${csvIdGroups[key].length} documents`);
      if (csvIdGroups[key].length > 1 && (key === 'null' || key === 'undefined')) {
        console.log(`  ⚠️  Multiple documents with ${key} csvId - this causes the error!`);
        console.log(`  Document IDs: ${csvIdGroups[key].join(', ')}`);
      }
    });

    // Check current indexes
    console.log('\n=== Current indexes ===');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log(`Index: ${JSON.stringify(index.key)} - Options: ${JSON.stringify(index)}`);
    });

    // Check for custom problems specifically
    console.log('\n=== Custom problem statements ===');
    const customProblems = await collection.find({ isCustom: true }).toArray();
    console.log(`Custom problems count: ${customProblems.length}`);
    customProblems.forEach(doc => {
      console.log(`  ID: ${doc._id}, csvId: ${doc.csvId}, createdBy: ${doc.createdBy}`);
    });

    console.log('\n=== Debug completed ===');
    
  } catch (error) {
    console.error('Error debugging csvId issue:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

debugCsvIdIssue();