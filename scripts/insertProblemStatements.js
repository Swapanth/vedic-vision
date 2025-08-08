import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../server/.env') });

// Import the ProblemStatement model
const problemStatementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
}, { timestamps: true });

const ProblemStatement = mongoose.model('ProblemStatement', problemStatementSchema);

// Dummy problem statements data
const dummyProblemStatements = [
  {
    title: "Smart Traffic Management System",
    description: "Design and develop an intelligent traffic management system that uses IoT sensors and AI algorithms to optimize traffic flow in urban areas. The system should reduce congestion, minimize waiting times at intersections, and provide real-time traffic updates to commuters. Consider integration with existing infrastructure and scalability for different city sizes."
  },
  {
    title: "Sustainable Water Management Platform",
    description: "Create a comprehensive water management platform that monitors water quality, tracks usage patterns, and predicts demand across residential and commercial areas. The solution should include leak detection, automated billing, and conservation recommendations. Focus on sustainability and cost-effectiveness for municipal water departments."
  },
  {
    title: "Digital Healthcare Assistant for Rural Areas",
    description: "Develop a mobile-first healthcare platform that connects rural patients with medical professionals through telemedicine. Include features for symptom checking, medication reminders, health record management, and emergency services coordination. The solution should work with limited internet connectivity and be accessible in local languages."
  },
  {
    title: "AI-Powered Educational Content Personalization",
    description: "Build an adaptive learning platform that personalizes educational content based on individual student learning patterns, preferences, and performance. The system should support multiple subjects, provide interactive assessments, and offer detailed analytics for teachers and parents. Consider accessibility and engagement for different age groups."
  },
  {
    title: "Blockchain-Based Supply Chain Transparency",
    description: "Design a blockchain solution that provides end-to-end transparency in supply chains, from raw materials to final products. The platform should track product authenticity, ensure ethical sourcing, and provide consumers with detailed product journey information. Focus on scalability and integration with existing supply chain systems."
  },
  {
    title: "Smart Energy Grid Optimization",
    description: "Develop a smart grid management system that optimizes energy distribution using renewable sources, predicts demand patterns, and manages load balancing. The solution should integrate solar, wind, and traditional energy sources while minimizing waste and reducing costs for both providers and consumers."
  },
  {
    title: "Mental Health Support Chatbot",
    description: "Create an AI-powered chatbot that provides 24/7 mental health support, mood tracking, and crisis intervention. The system should offer personalized coping strategies, connect users with professional help when needed, and maintain strict privacy and security standards. Include multilingual support and cultural sensitivity."
  },
  {
    title: "Waste Management Optimization System",
    description: "Build a smart waste management platform that optimizes collection routes, monitors bin levels using IoT sensors, and promotes recycling through gamification. The system should reduce operational costs, improve environmental impact, and engage citizens in sustainable waste practices."
  },
  {
    title: "Precision Agriculture Monitoring Platform",
    description: "Develop an IoT-based agriculture platform that monitors soil conditions, weather patterns, and crop health to optimize farming practices. Include features for automated irrigation, pest detection, yield prediction, and resource management. The solution should be cost-effective for small to medium-sized farms."
  },
  {
    title: "Elderly Care Monitoring System",
    description: "Create a comprehensive elderly care platform that monitors health vitals, detects emergencies, manages medications, and facilitates communication with family and caregivers. The system should be user-friendly for seniors, provide peace of mind for families, and integrate with healthcare providers."
  },
  {
    title: "Smart Parking Management Solution",
    description: "Design a smart parking system that helps drivers find available parking spots in real-time, enables mobile payments, and optimizes parking space utilization. Include features for reservation booking, dynamic pricing, and integration with navigation apps. Consider both street parking and parking garage scenarios."
  },
  {
    title: "Food Waste Reduction Platform",
    description: "Build a platform that connects restaurants, grocery stores, and food banks to reduce food waste. Include features for surplus food listing, expiration tracking, donation coordination, and impact measurement. The solution should be easy to use for businesses and help them meet sustainability goals."
  },
  {
    title: "Disaster Response Coordination System",
    description: "Develop a comprehensive disaster response platform that coordinates emergency services, manages resource allocation, and provides real-time communication during natural disasters. Include features for evacuation planning, shelter management, and volunteer coordination. The system should work reliably during infrastructure disruptions."
  },
  {
    title: "Student Performance Analytics Dashboard",
    description: "Create an analytics platform that helps educational institutions track student performance, identify at-risk students, and optimize teaching strategies. Include predictive modeling, intervention recommendations, and comprehensive reporting for administrators, teachers, and counselors."
  },
  {
    title: "Carbon Footprint Tracking Application",
    description: "Build a mobile application that helps individuals and businesses track, analyze, and reduce their carbon footprint. Include features for activity logging, impact visualization, reduction recommendations, and progress sharing. The app should gamify sustainability and provide actionable insights for environmental improvement."
  }
];

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

// Function to insert dummy problem statements
const insertProblemStatements = async () => {
  try {
    console.log('🚀 Starting to insert dummy problem statements...');
    
    // Clear existing problem statements (optional - comment out if you want to keep existing data)
    await ProblemStatement.deleteMany({});
    console.log('🗑️  Cleared existing problem statements');
    
    // Insert dummy data
    const insertedStatements = await ProblemStatement.insertMany(dummyProblemStatements);
    
    console.log(`✅ Successfully inserted ${insertedStatements.length} problem statements:`);
    insertedStatements.forEach((statement, index) => {
      console.log(`   ${index + 1}. ${statement.title}`);
    });
    
    console.log('\n📊 Summary:');
    console.log(`   Total problem statements: ${insertedStatements.length}`);
    console.log(`   Database: ${process.env.MONGODB_URI ? 'Remote' : 'Local'}`);
    console.log('   Status: ✅ Complete');
    
  } catch (error) {
    console.error('❌ Error inserting problem statements:', error.message);
    process.exit(1);
  }
};

// Main execution function
const main = async () => {
  try {
    await connectDB();
    await insertProblemStatements();
    
    console.log('\n🎉 Script completed successfully!');
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