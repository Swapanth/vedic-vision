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

// CSV parsing function
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  console.log('CSV Headers found:', headers);
  
  const users = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.trim());
    
    if (values.length >= 4) {
      const user = {
        email: values[0],
        name: values[1],
        collegeName: values[2],
        mobile: values[3],
        password: values[3], // Using mobile number as password
        role: 'participant' // Default role
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

// Bulk import users
async function bulkImportUsers(csvFilePath) {
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
    const users = parseCSV(csvContent);
    console.log(`Found ${users.length} users to import`);
    
    if (users.length === 0) {
      console.log('No users found in CSV file');
      process.exit(0);
    }
    
    // Display first few users for verification
    console.log('\nSample users to be imported:');
    users.slice(0, 3).forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.collegeName} - ${user.mobile}`);
    });
    
    // Import users
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    console.log('\nStarting bulk import...');
    
    for (let i = 0; i < users.length; i++) {
      try {
        const userData = users[i];
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          console.log(`⚠️  User already exists: ${userData.email}`);
          errorCount++;
          errors.push({ row: i + 2, email: userData.email, error: 'User already exists' });
          continue;
        }
        
        // Create new user
        const user = new User(userData);
        await user.save();
        
        successCount++;
        console.log(`✅ Imported: ${userData.name} (${userData.email})`);
        
      } catch (error) {
        errorCount++;
        const errorMsg = error.code === 11000 ? 'Duplicate email' : error.message;
        errors.push({ row: i + 2, email: users[i].email, error: errorMsg });
        console.log(`❌ Error importing ${users[i].email}: ${errorMsg}`);
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('BULK IMPORT SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total users in CSV: ${users.length}`);
    console.log(`Successfully imported: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\nErrors encountered:');
      errors.forEach(error => {
        console.log(`Row ${error.row}: ${error.email} - ${error.error}`);
      });
    }
    
    console.log('\nBulk import completed!');
    
  } catch (error) {
    console.error('Bulk import failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Main execution
async function main() {
  const csvFilePath = process.argv[2];
  
  if (!csvFilePath) {
    console.log('Usage: node bulkImportUsers.js <path-to-csv-file>');
    console.log('\nExpected CSV format:');
    console.log('Email,Name,College Name,Mobile Number');
    console.log('john@example.com,John Doe,ABC College,9876543210');
    console.log('jane@example.com,Jane Smith,XYZ University,9876543211');
    console.log('\nNote: Password will be set to the mobile number for each user.');
    process.exit(1);
  }
  
  const fullPath = path.resolve(csvFilePath);
  console.log(`Starting bulk user import from: ${fullPath}`);
  
  await bulkImportUsers(fullPath);
}

main();
