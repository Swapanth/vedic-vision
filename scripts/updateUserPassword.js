import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from server directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.join(__dirname, '..', 'server');
dotenv.config({ path: path.join(serverDir, '.env') });

// User schema (same as in the model)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  collegeName: { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['participant', 'mentor', 'superadmin'], default: 'participant' },
  profilePicture: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  totalScore: { type: Number, default: 0 },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  assignedMentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  description: { type: String, default: '', trim: true },
  skills: [{ type: String, trim: true }],
  registrationDate: { type: Date, default: Date.now }
}, { timestamps: true });

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

// Update user password using mobile number
async function updateUserPassword(email, newPassword) {
  try {
    await connectDB();
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`❌ User not found with email: ${email}`);
      return;
    }
    
    console.log(`📋 Found user: ${user.name} (${user.email})`);
    console.log(`📱 Mobile: ${user.mobile}`);
    console.log(`🏫 College: ${user.collegeName}`);
    console.log(`👤 Role: ${user.role}`);
    console.log(`✅ Active: ${user.isActive}`);
    
    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();
    
    console.log(`✅ Password updated successfully for ${user.email}`);
    console.log(`🔑 New password: ${newPassword}`);
    
    // Test the new password
    console.log('\n🧪 Testing new password...');
    const isValid = await user.comparePassword(newPassword);
    console.log(`Password verification: ${isValid ? '✅ SUCCESS' : '❌ FAILED'}`);
    
  } catch (error) {
    console.error('❌ Error updating password:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

// Main execution
async function main() {
  const email = process.argv[2];
  const newPassword = process.argv[3];
  
  if (!email) {
    console.log('Usage: node updateUserPassword.js <email> [newPassword]');
    console.log('\nExamples:');
    console.log('node updateUserPassword.js leelamadhavnulakani@gmail.com');
    console.log('node updateUserPassword.js leelamadhavnulakani@gmail.com 9133603383');
    console.log('\nIf no password is provided, the user\'s mobile number will be used as password.');
    process.exit(1);
  }
  
  console.log(`🔄 Updating password for: ${email}`);
  
  if (newPassword) {
    await updateUserPassword(email, newPassword);
  } else {
    // If no password provided, we'll fetch the user first to get their mobile number
    try {
      await connectDB();
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        console.log(`❌ User not found with email: ${email}`);
        process.exit(1);
      }
      
      console.log(`📱 Using mobile number as password: ${user.mobile}`);
      await mongoose.connection.close();
      await updateUserPassword(email, user.mobile);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }
}

main();