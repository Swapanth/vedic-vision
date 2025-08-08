import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from server directory
dotenv.config({ path: '../server/.env' });

// Problem Statement Schema
const problemStatementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
}, { timestamps: true });

const ProblemStatement = mongoose.model('ProblemStatement', problemStatementSchema);

// Quick dummy data for testing
const testProblems = [
  {
    title: "E-Commerce Mobile App",
    description: "Build a mobile e-commerce application with user authentication, product catalog, shopping cart, and payment integration."
  },
  {
    title: "Task Management System",
    description: "Create a web-based task management system with team collaboration features, deadline tracking, and progress monitoring."
  },
  {
    title: "Weather Monitoring Dashboard",
    description: "Develop a real-time weather monitoring dashboard that displays current conditions, forecasts, and historical data visualization."
  },
  {
    title: "Online Learning Platform",
    description: "Design an online learning platform with course management, video streaming, quizzes, and student progress tracking."
  },
  {
    title: "Inventory Management System",
    description: "Build an inventory management system for small businesses with stock tracking, low inventory alerts, and sales reporting."
  }
];

async function insertDummyProblems() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Insert dummy problems
    const result = await ProblemStatement.insertMany(testProblems);
    console.log(`🎉 Inserted ${result.length} dummy problem statements`);

    // Display inserted problems
    result.forEach((problem, index) => {
      console.log(`${index + 1}. ${problem.title}`);
    });

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

insertDummyProblems();