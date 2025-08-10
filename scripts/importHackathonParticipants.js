import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables from server directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.join(__dirname, '..', 'server');
dotenv.config({ path: path.join(serverDir, '.env') });

// User model definition
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  collegeName: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['participant', 'mentor', 'admin', 'superadmin'],
    default: 'participant'
  },
  profilePicture: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalScore: {
    type: Number,
    default: 0
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  assignedMentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedParticipants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  description: {
    type: String,
    default: '',
    trim: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Parse CSV content
function parseHackathonCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const users = [];
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',');
    
    if (values.length >= 4) {
      const email = values[0].trim().toLowerCase();
      const name = values[1].trim();
      const collegeName = values[2].trim();
      const mobile = values[3].trim();
      
      // Clean up email (remove extra spaces)
      const cleanEmail = email.replace(/\s+/g, '');
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        console.log(`⚠️  Invalid email format: ${cleanEmail} (row ${i + 1})`);
        continue;
      }
      
      // Validate mobile number (should be 10 digits)
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(mobile)) {
        console.log(`⚠️  Invalid mobile format: ${mobile} (row ${i + 1})`);
        continue;
      }
      
      const user = {
        email: cleanEmail,
        name: name,
        collegeName: collegeName,
        mobile: mobile,
        password: mobile, // Using mobile number as password
        role: 'participant',
        participantType: 'hackathon'
      };
      
      users.push(user);
    }
  }
  
  return users;
}

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Import hackathon participants
async function importHackathonParticipants() {
  try {
    // Connect to database
    await connectDB();
    
    // Read the hackathon CSV file
    const csvFilePath = path.join(__dirname, 'hackathonusers - Sheet1.csv');
    
    if (!fs.existsSync(csvFilePath)) {
      console.error(`❌ CSV file not found: ${csvFilePath}`);
      process.exit(1);
    }
    
    console.log(`📄 Reading CSV file: ${csvFilePath}`);
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    // Parse CSV
    const users = parseHackathonCSV(csvContent);
    console.log(`📊 Found ${users.length} valid participants to import`);
    
    if (users.length === 0) {
      console.log('❌ No valid participants found in CSV file');
      process.exit(0);
    }
    
    // Display sample users for verification
    console.log('\n📋 Sample participants to be imported:');
    users.slice(0, 5).forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      console.log(`      College: ${user.collegeName}`);
      console.log(`      Mobile: ${user.mobile}`);
      console.log('');
    });
    
    // Import participants
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    console.log('🚀 Starting import process...\n');
    
    for (let i = 0; i < users.length; i++) {
      try {
        const userData = users[i];
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          console.log(`⚠️  User already exists: ${userData.email}`);
          errorCount++;
          errors.push({ 
            participant: userData.name, 
            email: userData.email, 
            error: 'User already exists' 
          });
          continue;
        }
        
        // Create new participant
        const user = new User(userData);
        await user.save();
        
        successCount++;
        console.log(`✅ Imported: ${userData.name} (${userData.email})`);
        
      } catch (error) {
        errorCount++;
        const errorMsg = error.code === 11000 ? 'Duplicate email' : error.message;
        errors.push({ 
          participant: users[i].name, 
          email: users[i].email, 
          error: errorMsg 
        });
        console.log(`❌ Error importing ${users[i].name}: ${errorMsg}`);
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎯 HACKATHON PARTICIPANTS IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`📊 Total participants in CSV: ${users.length}`);
    console.log(`✅ Successfully imported: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\n🚨 Errors encountered:');
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.participant} (${error.email}) - ${error.error}`);
      });
    }
    
    console.log('\n🎉 Hackathon participants import completed!');
    console.log('💡 Note: All participants can login using their mobile number as password');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Main execution
console.log('🎯 Hackathon Participants Import Script');
console.log('=====================================\n');

importHackathonParticipants();