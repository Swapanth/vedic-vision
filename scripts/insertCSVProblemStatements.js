import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import csv from 'csv-parser';

// Configure environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../server/.env') });

// Enhanced ProblemStatement schema to match CSV structure
const problemStatementSchema = new mongoose.Schema({
  csvId: { type: Number, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  domain: { type: String, required: true },
  suggestedTechnologies: { type: String },
  topic: { type: String }
}, { timestamps: true });

// Add text index for search functionality
problemStatementSchema.index({
  title: 'text',
  description: 'text',
  domain: 'text',
  suggestedTechnologies: 'text',
  topic: 'text'
});

const ProblemStatement = mongoose.model('ProblemStatement', problemStatementSchema);

// Function to connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Function to read CSV file and parse data
const readCSVData = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    const csvPath = path.join(__dirname, 'problemstatments - Sheet1.csv');
    
    console.log(`📖 Reading CSV file: ${csvPath}`);
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        // Clean and structure the data
        const problemStatement = {
          csvId: parseInt(data.ID),
          title: data.Title?.trim(),
          description: data['Problem Statement']?.trim(),
          domain: data.Domain?.trim(),
          suggestedTechnologies: data['Suggested Technologies']?.trim(),
          topic: data.Topic?.trim()
        };
        
        // Only add if we have required fields
        if (problemStatement.title && problemStatement.description) {
          results.push(problemStatement);
        }
      })
      .on('end', () => {
        console.log(`✅ Successfully parsed ${results.length} problem statements from CSV`);
        resolve(results);
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV file:', error.message);
        reject(error);
      });
  });
};

// Function to insert problem statements from CSV
const insertProblemStatements = async () => {
  try {
    console.log('🚀 Starting to insert problem statements from CSV...');
    
    // Read CSV data
    const csvData = await readCSVData();
    
    if (csvData.length === 0) {
      console.log('⚠️  No valid problem statements found in CSV file');
      return;
    }
    
    // Optional: Clear existing problem statements (uncomment if needed)
    // await ProblemStatement.deleteMany({});
    // console.log('🗑️  Cleared existing problem statements');
    
    // Insert CSV data
    const insertedStatements = await ProblemStatement.insertMany(csvData);
    
    console.log(`✅ Successfully inserted ${insertedStatements.length} problem statements:`);
    
    // Group by domain for better overview
    const domainGroups = {};
    insertedStatements.forEach((statement) => {
      const domain = statement.domain || 'Other';
      if (!domainGroups[domain]) {
        domainGroups[domain] = [];
      }
      domainGroups[domain].push(statement);
    });
    
    // Display summary by domain
    console.log('\n📊 Summary by Domain:');
    Object.keys(domainGroups).forEach(domain => {
      console.log(`   ${domain}: ${domainGroups[domain].length} problems`);
      domainGroups[domain].forEach((statement, index) => {
        console.log(`      ${index + 1}. ${statement.title}`);
      });
    });
    
    console.log('\n📈 Overall Summary:');
    console.log(`   Total problem statements: ${insertedStatements.length}`);
    console.log(`   Unique domains: ${Object.keys(domainGroups).length}`);
    console.log(`   Database: ${process.env.MONGODB_URI ? 'Remote' : 'Local'}`);
    console.log('   Status: ✅ Complete');
    
  } catch (error) {
    console.error('❌ Error inserting problem statements:', error.message);
    if (error.code === 11000) {
      console.error('   This might be due to duplicate entries. Consider clearing existing data first.');
    }
    process.exit(1);
  }
};

// Main execution function
const main = async () => {
  try {
    await connectDB();
    await insertProblemStatements();
    
    console.log('\n🎉 Script completed successfully!');
    console.log('💡 Tip: You can now use these problem statements in your application');
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the script
main();