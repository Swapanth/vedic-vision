import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from server directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.join(__dirname, '..', 'server');
dotenv.config({ path: path.join(serverDir, '.env') });

// User model definition (copied from server/src/models/User.js)
import bcrypt from 'bcryptjs';

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

// CSV parsing function for hackathon users
function parseHackathonUsersCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  console.log('CSV Headers found:', headers);
  
  const users = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.trim());
    
    if (values.length >= 4) {
      const user = {
        email: values[0].toLowerCase(),
        name: values[1],
        collegeName: values[2],
        mobile: values[3]
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
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Assign single mentor to all users from CSV
async function assignSingleMentorToCSVUsers(csvFilePath, mentorEmail) {
  try {
    // Connect to database
    await connectDB();
    
    // Check if CSV file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error(`CSV file not found: ${csvFilePath}`);
      console.log('Please ensure the CSV file exists and the path is correct.');
      process.exit(1);
    }
    
    // Read CSV file
    console.log(`Reading CSV file: ${csvFilePath}`);
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    // Parse CSV
    const users = parseHackathonUsersCSV(csvContent);
    console.log(`Found ${users.length} users to assign mentor to`);
    
    if (users.length === 0) {
      console.log('No users found in CSV file');
      process.exit(0);
    }
    
    // Find mentor
    console.log(`Looking for mentor: ${mentorEmail}`);
    const mentor = await User.findOne({ 
      email: mentorEmail.toLowerCase(), 
      role: 'mentor' 
    });
    
    if (!mentor) {
      console.error(`❌ Mentor not found: ${mentorEmail}`);
      console.log('Please ensure the mentor exists in the database with role "mentor"');
      process.exit(1);
    }
    
    console.log(`✅ Found mentor: ${mentor.name} (${mentor.email})`);
    
    // Display first few users for verification
    console.log('\nSample users to be assigned:');
    users.slice(0, 5).forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
    });
    
    // Process assignments
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    console.log('\nStarting mentor assignment...');
    
    for (let i = 0; i < users.length; i++) {
      try {
        const { email, name } = users[i];
        
        // Find participant
        const participant = await User.findOne({ 
          email: email, 
          role: 'participant' 
        });
        
        if (!participant) {
          errorCount++;
          errors.push({ 
            row: i + 2, 
            email, 
            name,
            error: 'Participant not found or not a participant role' 
          });
          console.log(`❌ Participant not found: ${email}`);
          continue;
        }
        
        // Check if participant already has a mentor assigned
        if (participant.assignedMentor && participant.assignedMentor.toString() !== mentor._id.toString()) {
          console.log(`⚠️  Participant ${email} already has a different mentor assigned. Updating...`);
        }
        
        // Update participant's assigned mentor
        participant.assignedMentor = mentor._id;
        await participant.save();
        
        // Add participant to mentor's assigned participants if not already there
        if (!mentor.assignedParticipants.includes(participant._id)) {
          mentor.assignedParticipants.push(participant._id);
        }
        
        successCount++;
        console.log(`✅ Assigned: ${participant.name} (${email}) → ${mentor.name}`);
        
      } catch (error) {
        errorCount++;
        const errorMsg = error.message;
        errors.push({ 
          row: i + 2, 
          email: users[i].email, 
          name: users[i].name,
          error: errorMsg 
        });
        console.log(`❌ Error processing user ${i + 1}: ${errorMsg}`);
      }
    }
    
    // Save mentor with updated assigned participants
    try {
      await mentor.save();
      console.log(`✅ Updated mentor's assigned participants list`);
    } catch (error) {
      console.log(`⚠️  Warning: Could not update mentor's assigned participants: ${error.message}`);
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('MENTOR ASSIGNMENT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total users in CSV: ${users.length}`);
    console.log(`Successfully assigned: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Mentor: ${mentor.name} (${mentor.email})`);
    
    if (errors.length > 0) {
      console.log('\nErrors encountered:');
      errors.forEach(error => {
        console.log(`Row ${error.row}: ${error.name} (${error.email})`);
        console.log(`  Error: ${error.error}\n`);
      });
    }
    
    console.log('\nMentor assignment completed!');
    
  } catch (error) {
    console.error('Mentor assignment failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Main execution
async function main() {
  const csvFilePath = process.argv[2];
  const mentorEmail = process.argv[3];
  
  if (!csvFilePath || !mentorEmail) {
    console.log('Usage: node assignSingleMentorToCSVUsers.js <path-to-csv-file> <mentor-email>');
    console.log('\nExample:');
    console.log('node assignSingleMentorToCSVUsers.js "hackathonusers - Sheet1.csv" swapanthvakapalli@gmail.com');
    console.log('\nExpected CSV format:');
    console.log('Email,Name,College Name,Mobile Number');
    console.log('user1@example.com,User One,College Name,1234567890');
    console.log('user2@example.com,User Two,College Name,1234567891');
    console.log('\nNote: ');
    console.log('- All participants must exist in the database with role "participant"');
    console.log('- The mentor must exist in the database with role "mentor"');
    console.log('- If a participant already has a mentor, it will be updated');
    process.exit(1);
  }
  
  const fullPath = path.resolve(csvFilePath);
  console.log(`Starting mentor assignment from: ${fullPath}`);
  console.log(`Assigning mentor: ${mentorEmail}`);
  
  await assignSingleMentorToCSVUsers(fullPath, mentorEmail);
}

main();