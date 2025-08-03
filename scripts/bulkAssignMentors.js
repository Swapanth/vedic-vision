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

// CSV parsing function for assignments
function parseAssignmentCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  console.log('CSV Headers found:', headers);
  
  const assignments = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.trim());
    
    if (values.length >= 2) {
      const assignment = {
        participantEmail: values[0].toLowerCase(),
        mentorEmail: values[1].toLowerCase()
      };
      assignments.push(assignment);
    }
  }
  
  return assignments;
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

// Bulk assign mentors to participants
async function bulkAssignMentors(csvFilePath) {
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
    const assignments = parseAssignmentCSV(csvContent);
    console.log(`Found ${assignments.length} assignments to process`);
    
    if (assignments.length === 0) {
      console.log('No assignments found in CSV file');
      process.exit(0);
    }
    
    // Display first few assignments for verification
    console.log('\nSample assignments to be processed:');
    assignments.slice(0, 5).forEach((assignment, index) => {
      console.log(`${index + 1}. ${assignment.participantEmail} → ${assignment.mentorEmail}`);
    });
    
    // Process assignments
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    console.log('\nStarting bulk mentor assignment...');
    
    for (let i = 0; i < assignments.length; i++) {
      try {
        const { participantEmail, mentorEmail } = assignments[i];
        
        // Find participant
        const participant = await User.findOne({ 
          email: participantEmail, 
          role: 'participant' 
        });
        
        if (!participant) {
          errorCount++;
          errors.push({ 
            row: i + 2, 
            participantEmail, 
            mentorEmail, 
            error: 'Participant not found or not a participant role' 
          });
          console.log(`❌ Participant not found: ${participantEmail}`);
          continue;
        }
        
        // Find mentor
        const mentor = await User.findOne({ 
          email: mentorEmail, 
          role: 'mentor' 
        });
        
        if (!mentor) {
          errorCount++;
          errors.push({ 
            row: i + 2, 
            participantEmail, 
            mentorEmail, 
            error: 'Mentor not found or not a mentor role' 
          });
          console.log(`❌ Mentor not found: ${mentorEmail}`);
          continue;
        }
        
        // Check if participant already has a mentor assigned
        if (participant.assignedMentor && participant.assignedMentor.toString() !== mentor._id.toString()) {
          console.log(`⚠️  Participant ${participantEmail} already has a different mentor assigned. Updating...`);
        }
        
        // Update participant's assigned mentor
        participant.assignedMentor = mentor._id;
        await participant.save();
        
        // Add participant to mentor's assigned participants if not already there
        if (!mentor.assignedParticipants.includes(participant._id)) {
          mentor.assignedParticipants.push(participant._id);
          await mentor.save();
        }
        
        successCount++;
        console.log(`✅ Assigned: ${participant.name} (${participantEmail}) → ${mentor.name} (${mentorEmail})`);
        
      } catch (error) {
        errorCount++;
        const errorMsg = error.message;
        errors.push({ 
          row: i + 2, 
          participantEmail: assignments[i].participantEmail, 
          mentorEmail: assignments[i].mentorEmail, 
          error: errorMsg 
        });
        console.log(`❌ Error processing assignment ${i + 1}: ${errorMsg}`);
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('BULK MENTOR ASSIGNMENT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total assignments in CSV: ${assignments.length}`);
    console.log(`Successfully processed: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\nErrors encountered:');
      errors.forEach(error => {
        console.log(`Row ${error.row}: ${error.participantEmail} → ${error.mentorEmail}`);
        console.log(`  Error: ${error.error}\n`);
      });
    }
    
    console.log('\nBulk mentor assignment completed!');
    
  } catch (error) {
    console.error('Bulk mentor assignment failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Main execution
async function main() {
  const csvFilePath = process.argv[2];
  
  if (!csvFilePath) {
    console.log('Usage: node bulkAssignMentors.js <path-to-csv-file>');
    console.log('\nExpected CSV format:');
    console.log('participate_email,mentor_email');
    console.log('participant1@example.com,mentor1@example.com');
    console.log('participant2@example.com,mentor1@example.com');
    console.log('participant3@example.com,mentor2@example.com');
    console.log('\nNote: ');
    console.log('- Both participants and mentors must exist in the database');
    console.log('- Participants must have role "participant"');
    console.log('- Mentors must have role "mentor"');
    console.log('- If a participant already has a mentor, it will be updated');
    process.exit(1);
  }
  
  const fullPath = path.resolve(csvFilePath);
  console.log(`Starting bulk mentor assignment from: ${fullPath}`);
  
  await bulkAssignMentors(fullPath);
}

main();