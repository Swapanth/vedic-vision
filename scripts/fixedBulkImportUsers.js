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

// Improved CSV parsing function that handles commas in data
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  
  console.log('CSV Headers found:', headers);
  
  const users = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    console.log(`Row ${i + 1}: Parsing line with ${values.length} values`);
    console.log(`Values: [${values.map(v => `"${v}"`).join(', ')}]`);
    
    if (values.length >= 4) {
      const user = {
        email: values[0].toLowerCase().trim(),
        name: values[1].trim(),
        collegeName: values[2].trim(),
        mobile: values[3].trim(),
        password: values[3].trim(), // Using mobile number as password
        role: 'participant' // Default role
      };
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        console.log(`⚠️  Invalid email format: ${user.email}`);
        continue;
      }
      
      // Validate mobile number (should be digits only)
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(user.mobile)) {
        console.log(`⚠️  Invalid mobile format: ${user.mobile}`);
        continue;
      }
      
      users.push(user);
      console.log(`✅ Parsed user: ${user.email}`);
    } else {
      console.log(`⚠️  Skipping row ${i + 1}: insufficient data (${values.length} values)`);
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

// Check specific user
async function checkSpecificUser(email) {
  try {
    await connectDB();
    
    console.log(`\nChecking user: ${email}`);
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      console.log('✅ User found in database:');
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Mobile: ${user.mobile}`);
      console.log(`   College: ${user.collegeName}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Role: ${user.role}`);
      
      // Test password comparison with mobile number
      const isValidPassword = await user.comparePassword(user.mobile);
      console.log(`   Password (mobile) works: ${isValidPassword}`);
      
    } else {
      console.log('❌ User not found in database');
      
      // Check if user exists in CSV
      const csvPath = path.join(__dirname, 'users.csv');
      if (fs.existsSync(csvPath)) {
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const users = parseCSV(csvContent);
        
        const csvUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (csvUser) {
          console.log('📄 User found in CSV but not in database:');
          console.log(`   Name: ${csvUser.name}`);
          console.log(`   Email: ${csvUser.email}`);
          console.log(`   Mobile: ${csvUser.mobile}`);
          console.log(`   College: ${csvUser.collegeName}`);
          console.log('\n💡 User needs to be imported to database');
        } else {
          console.log('❌ User not found in CSV either');
        }
      }
    }
    
  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Bulk import users with improved parsing
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
    
    // Parse CSV with improved parser
    const users = parseCSV(csvContent);
    console.log(`Found ${users.length} valid users to import`);
    
    if (users.length === 0) {
      console.log('No valid users found in CSV file');
      process.exit(0);
    }
    
    // Display first few users for verification
    console.log('\nSample users to be imported:');
    users.slice(0, 5).forEach((user, index) => {
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
  const command = process.argv[2];
  
  if (command === 'check') {
    const email = process.argv[3];
    if (!email) {
      console.log('Usage: node fixedBulkImportUsers.js check <email>');
      process.exit(1);
    }
    await checkSpecificUser(email);
    
  } else if (command === 'import') {
    const csvFilePath = process.argv[3];
    if (!csvFilePath) {
      console.log('Usage: node fixedBulkImportUsers.js import <path-to-csv-file>');
      process.exit(1);
    }
    const fullPath = path.resolve(csvFilePath);
    console.log(`Starting bulk user import from: ${fullPath}`);
    await bulkImportUsers(fullPath);
    
  } else {
    console.log('Available commands:');
    console.log('  check <email>           - Check if user exists and verify data');
    console.log('  import <csv-file>       - Import users from CSV with improved parsing');
    console.log('');
    console.log('Examples:');
    console.log('  node fixedBulkImportUsers.js check leelamadhav.nulakani@gmail.com');
    console.log('  node fixedBulkImportUsers.js import users.csv');
  }
}

main();